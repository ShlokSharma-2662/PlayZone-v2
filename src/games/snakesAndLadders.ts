import type { ActionResult, GameEngine, Player } from '../shared/types';

export interface SnakesAndLaddersState {
  type: 'snakes_and_ladders';
  positions: Record<string, number>;
  turnOrder: string[];
  currentTurnIndex: number;
  turnExpiresAt: number;
  winnerId: string | 'draw' | null;
  lastRoll: number | null;
}

export type SnakesAndLaddersAction = { type: 'roll' };

const LADDERS: Record<number, number> = {
  1: 38, 4: 14, 9: 31, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 80: 100
};

const SNAKES: Record<number, number> = {
  16: 6, 47: 26, 49: 11, 56: 53, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 98: 78
};

export class SnakesAndLaddersEngine implements GameEngine<SnakesAndLaddersState, SnakesAndLaddersAction> {
  readonly id = 'snakes_and_ladders' as const;
  readonly minPlayers = 2;
  readonly maxPlayers = 5;

  initialState(players: Player[]): SnakesAndLaddersState {
    return {
      type: 'snakes_and_ladders',
      positions: Object.fromEntries(players.map((player) => [player.id, 1])),
      turnOrder: players.map((player) => player.id),
      currentTurnIndex: 0,
      turnExpiresAt: Date.now() + 30000,
      winnerId: null,
      lastRoll: null,
    };
  }

  applyAction(state: SnakesAndLaddersState, action: SnakesAndLaddersAction, playerId: string): ActionResult<SnakesAndLaddersState> {
    if (state.winnerId) return { state, events: [], winnerId: state.winnerId };

    if (action.type !== 'roll' || state.turnOrder[state.currentTurnIndex] !== playerId) {
      return { state, events: ['invalid-turn'], winnerId: state.winnerId };
    }

    const roll = 1 + Math.floor(Math.random() * 6);
    let currentPos = state.positions[playerId];
    let nextPos = currentPos + roll;

    // v2.0: Exact roll to 100 required. Overshoot = stay in place.
    if (nextPos > 100) {
      nextPos = currentPos;
    } else {
      // Apply snakes and ladders
      if (LADDERS[nextPos]) nextPos = LADDERS[nextPos];
      else if (SNAKES[nextPos]) nextPos = SNAKES[nextPos];
    }

    const nextPositions = { ...state.positions, [playerId]: nextPos };
    const winnerId = nextPos === 100 ? playerId : null;

    return {
      state: {
        ...state,
        positions: nextPositions,
        currentTurnIndex: (state.currentTurnIndex + 1) % state.turnOrder.length,
        turnExpiresAt: Date.now() + 30000,
        lastRoll: roll,
        winnerId,
      },
      events: ['dice-rolled'],
      winnerId,
    };
  }

  isTerminal(state: SnakesAndLaddersState): boolean {
    return state.winnerId !== null;
  }

  getWinner(state: SnakesAndLaddersState): string | 'draw' | null {
    return state.winnerId;
  }
}
