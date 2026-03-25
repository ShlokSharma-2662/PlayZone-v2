import type { ActionResult, GameEngine, Player } from '../shared/types';

export interface SnakeState {
  type: 'snake';
  gridSize: number;
  snakes: Record<string, { body: Array<{ x: number; y: number }>; direction: { dx: number; dy: number }; alive: boolean; score: number }>;
  food: Array<{ x: number; y: number }>;
  tick: number;
  speed: number;
  winnerId: string | 'draw' | null;
}

export type SnakeAction = { type: 'direction'; dx: number; dy: number };

export class SnakeEngine implements GameEngine<SnakeState, SnakeAction> {
  readonly id = 'snake' as const;
  readonly minPlayers = 2;
  readonly maxPlayers = 4;

  initialState(players: Player[]): SnakeState {
    const pCount = players.length;
    const gridSize = pCount <= 2 ? 30 : (pCount === 3 ? 35 : 40);

    const spawns = [
      { x: 2, y: 2, dx: 1, dy: 0 },
      { x: gridSize - 3, y: gridSize - 3, dx: -1, dy: 0 },
      { x: gridSize - 3, y: 2, dx: 0, dy: 1 },
      { x: 2, y: gridSize - 3, dx: 0, dy: -1 },
    ];

    const snakes = Object.fromEntries(players.map((player, index) => [
      player.id,
      {
        body: [{ x: spawns[index].x, y: spawns[index].y }],
        direction: { dx: spawns[index].dx, dy: spawns[index].dy },
        alive: true,
        score: 0,
      },
    ]));

    const food = players.map(() => ({
      x: Math.floor(Math.random() * (gridSize - 4)) + 2,
      y: Math.floor(Math.random() * (gridSize - 4)) + 2,
    }));

    return {
      type: 'snake',
      gridSize,
      snakes,
      food,
      tick: 0,
      speed: 150,
      winnerId: null,
    };
  }

  applyAction(state: SnakeState, action: SnakeAction, playerId: string): ActionResult<SnakeState> {
    if (action.type !== 'direction') return { state, events: [], winnerId: state.winnerId };
    const snake = state.snakes[playerId];
    if (!snake || !snake.alive) return { state, events: [], winnerId: state.winnerId };

    if (action.dx === -snake.direction.dx || action.dy === -snake.direction.dy) {
      return { state, events: ['invalid-direction'], winnerId: state.winnerId };
    }

    const nextSnakes = { ...state.snakes, [playerId]: { ...snake, direction: { dx: action.dx, dy: action.dy } } };
    return { state: { ...state, snakes: nextSnakes }, events: ['direction-updated'], winnerId: state.winnerId };
  }

  update(state: SnakeState): ActionResult<SnakeState> {
    if (state.winnerId) return { state, events: [], winnerId: state.winnerId };

    const nextSnakes = JSON.parse(JSON.stringify(state.snakes));
    let food = [...state.food];
    const events: string[] = [];

    // 1. Move
    Object.entries(nextSnakes).forEach(([id, snake]: [string, any]) => {
      if (!snake.alive) return;
      const head = snake.body[0];
      const nextHead = {
        x: (head.x + snake.direction.dx + state.gridSize) % state.gridSize,
        y: (head.y + snake.direction.dy + state.gridSize) % state.gridSize,
      };

      const foodIndex = food.findIndex(f => f.x === nextHead.x && f.y === nextHead.y);
      if (foodIndex !== -1) {
        snake.body = [nextHead, ...snake.body];
        snake.score += 10;
        events.push('food-eaten');
        food[foodIndex] = {
          x: Math.floor(Math.random() * state.gridSize),
          y: Math.floor(Math.random() * state.gridSize)
        };
      } else {
        snake.body = [nextHead, ...snake.body.slice(0, -1)];
      }
    });

    // 2. Collision
    Object.entries(nextSnakes).forEach(([id, snake]: [string, any]) => {
      if (!snake.alive) return;
      const head = snake.body[0];

      if (snake.body.slice(1).some((p: { x: number; y: number }) => p.x === head.x && p.y === head.y)) {
        snake.alive = false;
      }

      Object.entries(nextSnakes).forEach(([otherId, otherSnake]: [string, any]) => {
        if (id === otherId || !otherSnake.alive) return;
        if (otherSnake.body.some((p: { x: number; y: number }) => p.x === head.x && p.y === head.y)) {
          snake.alive = false;
        }
      });
    });

    // 3. Speed
    const nextTick = state.tick + 1;
    let nextSpeed = state.speed;
    if (nextTick % 300 === 0 && nextSpeed > 60) {
      nextSpeed = Math.max(60, nextSpeed - 10);
    }

    // 4. Winner
    const alivePlayers = Object.entries(nextSnakes).filter(([_, s]: [string, any]) => s.alive);
    let winnerId = state.winnerId;
    if (alivePlayers.length === 1 && Object.keys(nextSnakes).length > 1) {
      winnerId = alivePlayers[0][0];
    } else if (alivePlayers.length === 0) {
      winnerId = 'draw';
    }

    return {
      state: { ...state, snakes: nextSnakes, food, tick: nextTick, speed: nextSpeed, winnerId },
      events,
      winnerId,
    };
  }

  isTerminal(state: SnakeState): boolean {
    return state.winnerId !== null;
  }

  getWinner(state: SnakeState): string | 'draw' | null {
    return state.winnerId;
  }
}
