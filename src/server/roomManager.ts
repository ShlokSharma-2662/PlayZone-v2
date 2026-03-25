import type { GameKey, Player, Room, RoomCode } from '../shared/types';
import { normalizePlayerName, normalizeRoomCode } from '../shared/validation';

const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomRoomCode(length = 6): RoomCode {
  let code = '';
  for (let i = 0; i < length; i += 1) {
    code += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)];
  }
  return code;
}

export class RoomManager {
  private rooms = new Map<RoomCode, Room>();

  createRoom(hostName: string, game: GameKey = 'tictactoe') {
    const code = this.generateUniqueCode();
    const now = Date.now();
    const host: Player = {
      id: crypto.randomUUID(),
      name: normalizePlayerName(hostName) || 'Host',
      isHost: true,
      isReady: true,
      isConnected: true,
      score: 0,
      joinedAt: now,
      color: '#ef4444', // Red for host
    };

    const room: Room = {
      code,
      hostId: host.id,
      game,
      players: [host],
      spectators: [],
      status: 'LOBBY',
      createdAt: now,
      expiresAt: now + 30 * 60 * 1000, // 30 mins
    };

    this.rooms.set(code, room);
    return room;
  }

  joinRoom(code: string, playerName: string) {
    const room = this.rooms.get(normalizeRoomCode(code));
    if (!room) return null;
    if (room.players.length >= 5) return null; // v2.0 limit
    if (room.status !== 'LOBBY') return null;

    const now = Date.now();
    const player: Player = {
      id: crypto.randomUUID(),
      name: normalizePlayerName(playerName) || 'Player',
      isHost: false,
      isReady: false,
      isConnected: true,
      score: 0,
      color: this.getNextColor(room),
      joinedAt: now,
    };

    room.players.push(player);
    room.expiresAt = now + 30 * 60 * 1000;
    return { room, player };
  }

  getRoom(code: string) {
    return this.rooms.get(normalizeRoomCode(code)) ?? null;
  }

  kickPlayer(code: string, targetId: string) {
    const room = this.getRoom(code);
    if (!room) return null;
    room.players = room.players.filter(p => p.id !== targetId);
    return room;
  }

  resetRoomForRematch(code: string) {
    const room = this.getRoom(code);
    if (!room) return null;
    room.status = 'IN_GAME';
    room.players.forEach(p => p.isReady = true);
    return room;
  }

  setGame(code: string, game: GameKey) {
    const room = this.getRoom(code);
    if (!room) return null;
    room.game = game;
    room.expiresAt = Date.now() + 30 * 60 * 1000;
    return room;
  }

  toggleReady(code: string, playerId: string) {
    const room = this.getRoom(code);
    if (!room) return null;
    const player = room.players.find((p) => p.id === playerId);
    if (!player) return null;
    player.isReady = !player.isReady;
    room.expiresAt = Date.now() + 30 * 60 * 1000;
    return room;
  }

  markDisconnected(code: string, playerId: string) {
    const room = this.getRoom(code);
    if (!room) return null;
    const player = room.players.find((p) => p.id === playerId);
    if (player) {
      player.isConnected = false;
      if (player.isHost) {
        this.promoteNextHost(room);
      }
    }
    room.expiresAt = Date.now() + 30 * 60 * 1000;
    return room;
  }

  handleDisconnect(playerId: string) {
    // This is used for socket disconnect where we only have playerId
    this.rooms.forEach(room => {
      const player = room.players.find(p => p.id === playerId);
      if (player) {
        player.isConnected = false;
        if (player.isHost) this.promoteNextHost(room);
        room.status = 'PAUSED'; // v2.0 Requirement
      }
    });
  }

  private promoteNextHost(room: Room) {
    const nextHost = room.players.find((p) => p.isConnected);
    if (nextHost) {
      room.hostId = nextHost.id;
      nextHost.isHost = true;
      nextHost.isReady = true;
    }
  }

  private getNextColor(room: Room): string {
    const colors = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7']; // Added purple
    return colors[room.players.length] ?? colors[0];
  }

  private generateUniqueCode() {
    let code = randomRoomCode(6);
    while (this.rooms.has(code)) code = randomRoomCode(6);
    return code;
  }
}
