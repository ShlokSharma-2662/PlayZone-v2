import { SnakeEngine } from '../games/snake';
import { SnakesAndLaddersEngine } from '../games/snakesAndLadders';
import { TicTacToeEngine } from '../games/tictactoe';
import { LudoEngine } from '../games/ludo';
import { ChessEngine } from '../games/chess';

export const engineRegistry = {
  tictactoe: new TicTacToeEngine(),
  snakes_and_ladders: new SnakesAndLaddersEngine(),
  ludo: new LudoEngine(),
  snake: new SnakeEngine(),
  chess: new ChessEngine(),
} as const;
