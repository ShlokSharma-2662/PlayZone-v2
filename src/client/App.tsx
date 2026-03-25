import { useEffect, useState } from 'react';
import { createSocket } from './socket';
import type { Room, Player, GameKey } from '../shared/types';
import { normalizeRoomCode } from '../shared/validation';

import { Home } from './components/Home';
import { Lobby } from './components/Lobby';
import { GameShell } from './components/GameShell';
import { TicTacToeBoard } from './components/TicTacToeBoard';
import { SnakesAndLaddersBoard } from './components/SnakesAndLaddersBoard';
import { LudoBoard } from './components/LudoBoard';
import { SnakeBoard } from './components/SnakeBoard';
import { ChessBoard } from './components/ChessBoard';
import { MeshBackground } from './components/MeshBackground';
import { motion, AnimatePresence } from 'framer-motion';

const socket = createSocket();

export function App() {
  const [room, setRoom] = useState<Room | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [gameState, setGameState] = useState<any>(null);
  const [playerName, setPlayerName] = useState('Player');
  const [roomCodeInput, setRoomCodeInput] = useState('');

  useEffect(() => {
    socket.on('room:state', (updatedRoom: any) => {
      setRoom(updatedRoom);
      if (player) {
        const me = updatedRoom.players.find((p: Player) => p.id === player.id);
        if (me) setPlayer(me);
      } else if (updatedRoom.players.length > 0) {
        const latest = [...updatedRoom.players].sort((a, b) => b.joinedAt - a.joinedAt)[0];
        setPlayer(latest);
      }
    });

    socket.on('game:state', setGameState);
    socket.on('room:error', (err) => alert(err.message));

    return () => {
      socket.off('room:state');
      socket.off('game:state');
      socket.off('room:error');
    };
  }, [player]);

  const handleCreateRoom = () => socket.emit('room:create', { name: playerName });
  const handleJoinRoom = () => {
    if (!roomCodeInput) return;
    socket.emit('room:join', { code: normalizeRoomCode(roomCodeInput), name: playerName });
  };
  const handleReady = () => room && player && socket.emit('lobby:ready', { roomCode: room.code });
  const handleStart = () => room && socket.emit('lobby:start', { roomCode: room.code });
  const handleSwitchGame = (game: GameKey) => room && socket.emit('lobby:select_game', { roomCode: room.code, game });
  const handleAction = (action: any) => room && player && socket.emit('game:action', { roomCode: room.code, playerId: player.id, action });
  const handleKickPlayer = (targetId: string) => room && socket.emit('room:kick', { roomCode: room.code, targetId });
  const handleLeave = () => window.location.reload();

  if (!room || !player) {
    return (
      <main className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto">
        <Home
          playerName={playerName}
          setPlayerName={setPlayerName}
          roomCode={roomCodeInput}
          setRoomCode={setRoomCodeInput}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
        />
      </main>
    );
  }

  const canStart = room.players.length >= 2 && room.players.every(p => p.isReady);

  return (
    <>
      <MeshBackground />
      <main className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto relative z-10">
        <header className="mb-12 flex justify-between items-end">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h1 className="text-4xl font-black text-white italic tracking-tighter">PLAY<span className="text-primary">ZONE</span></h1>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">Premium Multiplayer v2.0</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="glass-premium px-6 py-3 rounded-2xl text-sm font-mono shadow-xl group"
          >
            <span className="text-slate-500 font-bold uppercase mr-3 group-hover:text-primary transition-colors">Room Code</span>
            <span className="text-white font-black tracking-widest">{room.code}</span>
          </motion.div>
        </header>

        <AnimatePresence mode="wait">
          {room.status === 'LOBBY' ? (
            <motion.div
              key="lobby"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <Lobby
                room={room}
                currentPlayerId={player.id}
                onToggleReady={handleReady}
                onStartGame={handleStart}
                onSwitchGame={handleSwitchGame}
                onKickPlayer={handleKickPlayer}
                canStart={canStart}
              />
            </motion.div>
          ) : (
            <motion.div
              key="game"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.4 }}
            >
              <GameShell
                room={room}
                currentPlayerId={player.id}
                onLeave={handleLeave}
                statusText={gameState?.winnerId ? (gameState.winnerId === 'draw' ? 'GAME DRAWN!' : `${room.players.find((p: any) => p.id === gameState.winnerId)?.name} WINS!`) : undefined}
              >
                {room.game === 'chess' && gameState && (
                  <ChessBoard
                    fen={gameState.fen}
                    turnId={gameState.turnOrder[gameState.currentTurnIndex]}
                    currentPlayerId={player.id}
                    players={gameState.players}
                    onMove={(move) => handleAction({ type: 'move', ...move })}
                  />
                )}
                {room.game === 'tictactoe' && gameState && (
                  <TicTacToeBoard
                    state={gameState}
                    currentPlayerId={player.id}
                    onAction={handleAction}
                  />
                )}
                {room.game === 'snakes_and_ladders' && gameState && (
                  <SnakesAndLaddersBoard
                    state={gameState}
                    roomPlayers={room.players}
                    currentPlayerId={player.id}
                    onAction={handleAction}
                  />
                )}
                {room.game === 'ludo' && gameState && (
                  <LudoBoard
                    state={gameState}
                    roomPlayers={room.players}
                    currentPlayerId={player.id}
                    onAction={handleAction}
                  />
                )}
                {room.game === 'snake' && gameState && (
                  <SnakeBoard
                    state={gameState}
                    roomPlayers={room.players}
                    currentPlayerId={player.id}
                    onAction={handleAction}
                  />
                )}
                {!gameState && (
                  <div className="flex flex-col items-center gap-4 py-20">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <div className="text-slate-500 font-black uppercase tracking-widest text-sm">Syncing State...</div>
                  </div>
                )}
              </GameShell>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}
