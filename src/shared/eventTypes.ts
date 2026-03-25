import type { GameKey, Room } from './types';
import type { TicTacToeAction } from '../games/tictactoe';

export type ClientToServerEvents = {
  'room:create': (payload: { name: string }) => void;
  'room:join': (payload: { code: string; name: string }) => void;
  'room:leave': () => void;
  'room:kick': (payload: { roomCode: string; targetId: string }) => void;
  'lobby:ready': (payload: { roomCode: string }) => void;
  'lobby:select_game': (payload: { roomCode: string; game: GameKey }) => void;
  'lobby:start': (payload: { roomCode: string }) => void;
  'game:action': (payload: { roomCode: string; playerId: string; action: any }) => void;
  'session:rematch': (payload: { roomCode: string }) => void;
  'session:new_game': (payload: { roomCode: string }) => void;
};

export type ServerToClientEvents = {
  'room:state': (room: Room) => void;
  'room:error': (error: { message: string }) => void;
  'game:state': (state: any) => void;
  'game:turn_timeout': (payload: { prevPlayerId: string }) => void;
  'game:over': (payload: { winner: string | null; reason?: string }) => void;
};
