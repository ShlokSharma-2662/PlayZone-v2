import { Chess } from 'chess.js';
import type { ActionResult, GameEngine, Player } from '../shared/types';

export interface ChessState {
    type: 'chess';
    fen: string;
    pgn: string;
    turn: 'w' | 'b';
    clocks: Record<string, number> | null;
    status: 'active' | 'check' | 'checkmate' | 'stalemate' | 'draw';
    winner: string | 'draw' | null;
}

export type ChessAction = { type: 'move'; from: string; to: string; promotion?: string };

export class ChessEngine implements GameEngine<ChessState, ChessAction> {
    readonly id = 'chess' as const;
    readonly minPlayers = 2;
    readonly maxPlayers = 2;

    initialState(players: Player[]): ChessState {
        const chess = new Chess();
        return {
            type: 'chess',
            fen: chess.fen(),
            pgn: '',
            turn: 'w',
            clocks: null,
            status: 'active',
            winner: null,
        };
    }

    applyAction(state: ChessState, action: ChessAction, playerId: string): ActionResult<ChessState> {
        const chess = new Chess(state.fen);

        // Validate turn
        const isWhite = state.turn === 'w';
        // Mapping player ID to colors would be needed, assuming first player is white for now
        // In a real app, RoomManager or server would track this.

        try {
            const move = chess.move({
                from: action.from,
                to: action.to,
                promotion: action.promotion ?? 'q',
            });

            if (!move) return { state, events: ['invalid-move'], winnerId: null };

            const isGameOver = chess.isGameOver();
            const isCheckmate = chess.isCheckmate();
            const isDraw = chess.isDraw() || chess.isStalemate() || chess.isThreefoldRepetition();

            let status: ChessState['status'] = 'active';
            if (isCheckmate) status = 'checkmate';
            else if (isDraw) status = 'draw';
            else if (chess.inCheck()) status = 'check';

            const winnerId = isCheckmate ? playerId : (isDraw ? 'draw' : null);

            return {
                state: {
                    ...state,
                    fen: chess.fen(),
                    pgn: chess.pgn(),
                    turn: chess.turn(),
                    status,
                    winner: winnerId,
                },
                events: ['move-made'],
                winnerId,
            };
        } catch (e) {
            return { state, events: ['invalid-move-error'], winnerId: null };
        }
    }

    isTerminal(state: ChessState): boolean {
        return state.status === 'checkmate' || state.status === 'draw' || state.status === 'stalemate';
    }

    getWinner(state: ChessState): string | 'draw' | null {
        return state.winner;
    }
}
