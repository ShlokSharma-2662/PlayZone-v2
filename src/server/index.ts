import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { RoomManager } from './roomManager';
import { engineRegistry } from '../shared/engineRegistry';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const rooms = new RoomManager();
const gameStateByRoom = new Map<string, any>();
const socketToPlayer = new Map<string, { roomCode: string; playerId: string }>();

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

io.on('connection', (socket) => {
  socket.on('room:create', ({ name }) => {
    const room = rooms.createRoom(name);
    socketToPlayer.set(socket.id, { roomCode: room.code, playerId: room.hostId });
    socket.join(room.code);
    socket.emit('room:created', { roomCode: room.code, player: room.players[0] });
    io.to(room.code).emit('room:state', room);
  });

  socket.on('room:join', ({ code, name }) => {
    const joined = rooms.joinRoom(code, name);
    if (!joined) {
      socket.emit('room:error', { code: 'ROOM_ERROR', message: 'Unable to join room' });
      return;
    }

    socketToPlayer.set(socket.id, { roomCode: joined.room.code, playerId: joined.player.id });
    socket.join(joined.room.code);
    io.to(joined.room.code).emit('room:state', joined.room);

    // Send current game state if in progress
    if (joined.room.status === 'IN_GAME' && gameStateByRoom.has(joined.room.code)) {
      socket.emit('game:state', gameStateByRoom.get(joined.room.code));
    }
  });

  socket.on('room:kick', ({ roomCode, targetId }) => {
    const room = rooms.getRoom(roomCode);
    const hostData = socketToPlayer.get(socket.id);
    if (room && hostData?.playerId === room.hostId) {
      const updated = rooms.kickPlayer(roomCode, targetId);
      if (updated) io.to(roomCode).emit('room:state', updated);
    }
  });

  socket.on('lobby:ready', ({ roomCode }) => {
    const data = socketToPlayer.get(socket.id);
    if (data) {
      const room = rooms.toggleReady(data.roomCode, data.playerId);
      if (room) io.to(data.roomCode).emit('room:state', room);
    }
  });

  socket.on('lobby:select_game', ({ roomCode, game }) => {
    const room = rooms.getRoom(roomCode);
    const hostData = socketToPlayer.get(socket.id);
    if (room && hostData?.playerId === room.hostId) {
      const updated = rooms.setGame(roomCode, game);
      if (updated) io.to(roomCode).emit('room:state', updated);
    }
  });

  socket.on('lobby:start', ({ roomCode }) => {
    const room = rooms.getRoom(roomCode);
    const hostData = socketToPlayer.get(socket.id);
    if (room && hostData?.playerId === room.hostId) {
      // Check if all players ready
      if (room.players.every(p => p.isReady)) {
        room.status = 'IN_GAME';
        const engine = engineRegistry[room.game];
        gameStateByRoom.set(roomCode, engine.initialState(room.players));
        io.to(roomCode).emit('room:state', room);
        io.to(roomCode).emit('game:state', gameStateByRoom.get(roomCode));
      }
    }
  });

  socket.on('game:action', ({ roomCode, action }) => {
    const data = socketToPlayer.get(socket.id);
    if (!data) return;

    const room = rooms.getRoom(data.roomCode);
    if (!room || room.status !== 'IN_GAME') return;

    const engine = engineRegistry[room.game] as any;
    const prevState = gameStateByRoom.get(data.roomCode);
    if (!prevState) return;

    const result = engine.applyAction(prevState, action, data.playerId);
    gameStateByRoom.set(data.roomCode, result.state);

    io.to(data.roomCode).emit('game:state', result.state);

    if (engine.isTerminal(result.state)) {
      room.status = 'GAME_OVER';
      const winnerId = engine.getWinner(result.state);

      // Update session scores
      if (winnerId && winnerId !== 'draw') {
        const winner = room.players.find(p => p.id === winnerId);
        if (winner) winner.score += 1;
      }

      io.to(data.roomCode).emit('room:state', room);
      io.to(data.roomCode).emit('game:over', { winner: winnerId });
    }
  });

  socket.on('session:rematch', ({ roomCode }) => {
    const room = rooms.getRoom(roomCode);
    const hostData = socketToPlayer.get(socket.id);
    if (room && hostData?.playerId === room.hostId) {
      const updated = rooms.resetRoomForRematch(roomCode);
      if (updated) {
        const engine = engineRegistry[updated.game];
        gameStateByRoom.set(roomCode, engine.initialState(updated.players));
        io.to(roomCode).emit('room:state', updated);
        io.to(roomCode).emit('game:state', gameStateByRoom.get(roomCode));
      }
    }
  });

  socket.on('session:new_game', ({ roomCode }) => {
    const room = rooms.getRoom(roomCode);
    const hostData = socketToPlayer.get(socket.id);
    if (room && hostData?.playerId === room.hostId) {
      room.status = 'LOBBY';
      room.players.forEach(p => p.isReady = p.isHost);
      io.to(roomCode).emit('room:state', room);
    }
  });

  socket.on('disconnect', () => {
    const data = socketToPlayer.get(socket.id);
    if (data) {
      rooms.handleDisconnect(data.playerId);
      const room = rooms.getRoom(data.roomCode);
      if (room) {
        io.to(data.roomCode).emit('room:state', room);
      }
      socketToPlayer.delete(socket.id);
    }
  });
});

const port = Number(process.env.PORT ?? 3001);
httpServer.listen(port, () => {
  console.log(`PlayZone server listening on ${port}`);
});

// Real-time Tick Loop (10Hz)
setInterval(() => {
  gameStateByRoom.forEach((state, roomCode) => {
    const room = rooms.getRoom(roomCode);
    if (!room || room.status !== 'IN_GAME') return;

    const engine = engineRegistry[room.game] as any;

    // Handle turn timers for turn-based games
    if (state.turnExpiresAt && Date.now() > state.turnExpiresAt) {
      if (room.game === 'chess') {
        // Forfeit game
        room.status = 'GAME_OVER';
        state.winnerId = state.players.find((p: any) => p.id !== state.turnOrder[state.currentTurnIndex])?.id || 'draw';

        if (state.winnerId !== 'draw') {
          const winner = room.players.find(p => p.id === state.winnerId);
          if (winner) winner.score += 1;
        }

        io.to(roomCode).emit('room:state', room);
        io.to(roomCode).emit('game:state', state);
        io.to(roomCode).emit('game:over', { winner: state.winnerId, reason: 'timeout' });
      } else {
        // Forfeit turn (TTT, S&L, Ludo)
        state.currentTurnIndex = (state.currentTurnIndex + 1) % state.turnOrder.length;
        state.turnExpiresAt = Date.now() + (room.game === 'tictactoe' ? 15000 : 30000);

        io.to(roomCode).emit('game:state', state);
        io.to(roomCode).emit('game:turn_timeout', { prevPlayerId: state.turnOrder[(state.currentTurnIndex - 1 + state.turnOrder.length) % state.turnOrder.length] });
      }
    }

    if (engine && engine.update) {
      const result = engine.update(state);
      gameStateByRoom.set(roomCode, result.state);
      io.to(roomCode).emit('game:state', result.state);

      if (engine.isTerminal(result.state)) {
        room.status = 'GAME_OVER';
        const winnerId = engine.getWinner(result.state);

        if (winnerId && winnerId !== 'draw') {
          const winner = room.players.find(p => p.id === winnerId);
          if (winner) winner.score += 1;
        }

        io.to(roomCode).emit('room:state', room);
        io.to(roomCode).emit('game:over', { winner: winnerId });
      }
    }
  });
}, 100);
