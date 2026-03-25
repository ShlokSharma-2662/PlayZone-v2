import type { ActionResult, GameEngine, Player } from '../shared/types';

export interface LudoState {
  type: 'ludo';
  turnOrder: string[];
  currentTurnIndex: number;
  turnExpiresAt: number;
  tokenPositions: Record<string, number[]>;
  winnerId: string | 'draw' | null;
  consecutiveSixes: number;
  lastRoll: number | null;
}

export type LudoAction = { type: 'roll' | 'move'; tokenIndex?: number };

export class LudoEngine implements GameEngine<LudoState, LudoAction> {
  readonly id = 'ludo' as const;
  readonly minPlayers = 2;
  readonly maxPlayers = 4;

  initialState(players: Player[]): LudoState {
    return {
      type: 'ludo',
      turnOrder: players.map((player) => player.id),
      currentTurnIndex: 0,
      turnExpiresAt: Date.now() + 30000,
      tokenPositions: Object.fromEntries(players.map((player) => [player.id, [-1, -1, -1, -1]])),
      winnerId: null,
      consecutiveSixes: 0,
      lastRoll: null,
    };
  }

  applyAction(state: LudoState, action: LudoAction, playerId: string): ActionResult<LudoState> {
    if (state.winnerId) return { state, events: [], winnerId: state.winnerId };
    if (state.turnOrder[state.currentTurnIndex] !== playerId) return { state, events: ['invalid-turn'], winnerId: state.winnerId };

    if (action.type === 'roll') {
      if (state.lastRoll !== null && rollRequiresMove(state.lastRoll, state.tokenPositions[playerId])) {
        return { state, events: ['must-move-token'], winnerId: state.winnerId };
      }
      const roll = 1 + Math.floor(Math.random() * 6);
      const nextConsecutiveSixes = roll === 6 ? state.consecutiveSixes + 1 : 0;

      if (nextConsecutiveSixes >= 3) {
        return {
          state: {
            ...state,
            lastRoll: null,
            consecutiveSixes: 0,
            currentTurnIndex: (state.currentTurnIndex + 1) % state.turnOrder.length,
            turnExpiresAt: Date.now() + 30000,
          },
          events: ['three-sixes-skip'],
          winnerId: null,
        };
      }

      const canMove = canAnyTokenMove(roll, state.tokenPositions[playerId]);
      if (!canMove && roll !== 6) {
        return {
          state: {
            ...state,
            lastRoll: roll,
            currentTurnIndex: (state.currentTurnIndex + 1) % state.turnOrder.length,
            turnExpiresAt: Date.now() + 30000,
            consecutiveSixes: 0
          },
          events: ['no-possible-moves'],
          winnerId: null
        };
      }

      return {
        state: { ...state, lastRoll: roll, consecutiveSixes: nextConsecutiveSixes },
        events: ['dice-rolled'],
        winnerId: null,
      };
    }

    if (action.type === 'move' && action.tokenIndex !== undefined) {
      if (state.lastRoll === null) return { state, events: ['must-roll-first'], winnerId: state.winnerId };

      const roll = state.lastRoll;
      const positions = [...state.tokenPositions[playerId]];
      const pos = positions[action.tokenIndex];

      if (pos === -1 && roll !== 6) return { state, events: ['need-six-to-start'], winnerId: state.winnerId };
      if (pos >= 56) return { state, events: ['token-finished'], winnerId: state.winnerId };
      if (pos + roll > 56) return { state, events: ['roll-too-high'], winnerId: state.winnerId };

      const nextPos = pos === -1 ? 0 : pos + roll;
      positions[action.tokenIndex] = nextPos;

      const nextTokenPositions = { ...state.tokenPositions, [playerId]: positions };
      const won = positions.every(p => p === 56);
      const nextTurn = (roll === 6 && !won) ? state.currentTurnIndex : (state.currentTurnIndex + 1) % state.turnOrder.length;

      return {
        state: {
          ...state,
          tokenPositions: nextTokenPositions,
          lastRoll: null,
          currentTurnIndex: nextTurn,
          turnExpiresAt: Date.now() + 30000,
          winnerId: won ? playerId : null,
        },
        events: ['token-moved'],
        winnerId: won ? playerId : null,
      };
    }

    return { state, events: ['invalid-action'], winnerId: state.winnerId };
  }

  isTerminal(state: LudoState): boolean {
    return state.winnerId !== null;
  }

  getWinner(state: LudoState): string | 'draw' | null {
    return state.winnerId;
  }
}

function canAnyTokenMove(roll: number, positions: number[]): boolean {
  return positions.some(pos => (pos === -1 && roll === 6) || (pos !== -1 && pos + roll <= 56));
}

function rollRequiresMove(roll: number, positions: number[]): boolean {
  return canAnyTokenMove(roll, positions);
}
