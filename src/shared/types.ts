export type GameKey = 'tictactoe' | 'snakes_and_ladders' | 'ludo' | 'snake' | 'chess';

export type RoomCode = string;

export interface Player {
  id: string; // Socket ID
  name: string; // Display name
  isHost: boolean;
  isReady: boolean;
  isConnected: boolean;
  color: string; // hex
  score: number; // session wins
  joinedAt: number;
}

export interface Room {
  code: RoomCode; // 6-char alphanumeric
  hostId: string;
  game: GameKey;
  players: Player[];
  spectators: Player[]; // Phase 2 reserve
  status: 'LOBBY' | 'IN_GAME' | 'GAME_OVER' | 'PAUSED';
  createdAt: number;
  expiresAt: number;
}

export interface ActionResult<TState> {
  state: TState;
  events: string[];
  winnerId: string | 'draw' | null;
}

export interface GameEngine<TState, TAction> {
  readonly id: GameKey;
  readonly minPlayers: number;
  readonly maxPlayers: number;
  initialState(players: Player[]): TState;
  applyAction(state: TState, action: TAction, playerId: string): ActionResult<TState>;
  update?(state: TState): ActionResult<TState>;
  isTerminal(state: TState): boolean;
  getWinner(state: TState): string | 'draw' | null;
}
