import type { ActionResult, GameEngine, Player } from '../shared/types';

export type TicTacToeMark = 'X' | 'O';

export interface TicTacToeState {
  type: 'tictactoe';
  board: Array<TicTacToeMark | null>;
  turnIndex: 0 | 1;
  turnExpiresAt: number; // Unix ms
  winnerId: string | 'draw' | null;
  winningLine: number[] | null;
  players: Array<{ id: string; mark: TicTacToeMark }>;
}

export interface TicTacToeAction {
  type: 'place';
  index: number;
}

export class TicTacToeEngine implements GameEngine<TicTacToeState, TicTacToeAction> {
  readonly id = 'tictactoe' as const;
  readonly minPlayers = 2;
  readonly maxPlayers = 2;

  initialState(players: Player[]): TicTacToeState {
    return {
      type: 'tictactoe',
      board: Array(9).fill(null),
      turnIndex: 0,
      turnExpiresAt: Date.now() + 15000, // 15s
      winnerId: null,
      winningLine: null,
      players: players.slice(0, 2).map((player, index) => ({
        id: player.id,
        mark: index === 0 ? 'X' : 'O',
      })),
    };
  }

  applyAction(state: TicTacToeState, action: TicTacToeAction, playerId: string): ActionResult<TicTacToeState> {
    if (state.winnerId) return { state, events: [], winnerId: state.winnerId };

    const playerIndex = state.players.findIndex((player) => player.id === playerId);
    if (playerIndex !== state.turnIndex) return { state, events: ['invalid-turn'], winnerId: state.winnerId };

    if (action.type !== 'place' || action.index < 0 || action.index > 8 || state.board[action.index]) {
      return { state, events: ['invalid-move'], winnerId: state.winnerId };
    }

    const nextBoard = [...state.board];
    nextBoard[action.index] = state.players[playerIndex].mark;

    const { winnerId, winningLine } = this.checkWinner(nextBoard, state.players);
    const isDraw = !winnerId && nextBoard.every(Boolean);
    const finalWinnerId = isDraw ? 'draw' : winnerId;

    const nextState: TicTacToeState = {
      ...state,
      board: nextBoard,
      turnIndex: state.turnIndex === 0 ? 1 : 0,
      turnExpiresAt: Date.now() + 15000,
      winnerId: finalWinnerId,
      winningLine: winningLine || null,
    };

    return { state: nextState, events: ['move-placed'], winnerId: finalWinnerId };
  }

  isTerminal(state: TicTacToeState): boolean {
    return state.winnerId !== null;
  }

  getWinner(state: TicTacToeState): string | 'draw' | null {
    return state.winnerId;
  }

  private checkWinner(board: Array<TicTacToeMark | null>, players: Array<{ id: string; mark: TicTacToeMark }>): { winnerId: string | null; winningLine: number[] | null } {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];
    for (const [a, b, c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return {
          winnerId: players.find(p => p.mark === board[a])?.id || null,
          winningLine: [a, b, c],
        };
      }
    }
    return { winnerId: null, winningLine: null };
  }
}
