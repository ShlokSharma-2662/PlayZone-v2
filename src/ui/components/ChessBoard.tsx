import React, { useState } from 'react';
import { Chess, Move } from 'chess.js';
import { motion, AnimatePresence } from 'framer-motion';
import type { Player } from '../../shared/types';

interface ChessBoardProps {
    fen: string;
    turnId: string;
    currentPlayerId: string;
    onMove: (move: { from: string; to: string; promotion?: string }) => void;
    players: Array<{ id: string; color: 'w' | 'b'; name: string }>;
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
    fen,
    turnId,
    currentPlayerId,
    onMove,
    players,
}) => {
    const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
    const game = new Chess(fen);
    const isMyTurn = turnId === currentPlayerId;
    const myColor = players.find(p => p.id === currentPlayerId)?.color || 'w';

    const board = game.board();

    const handleSquareClick = (square: string) => {
        if (!isMyTurn) return;

        if (selectedSquare === square) {
            setSelectedSquare(null);
            return;
        }

        if (selectedSquare) {
            // Try to move
            const move: any = {
                from: selectedSquare,
                to: square,
            };

            // Auto-promote to queen for simplicity on first pass
            const piece = game.get(selectedSquare as any);
            if (piece?.type === 'p' && (square[1] === '8' || square[1] === '1')) {
                move.promotion = 'q';
            }

            try {
                const result = game.move(move);
                if (result) {
                    onMove({ from: move.from, to: move.to, promotion: move.promotion });
                    setSelectedSquare(null);
                } else {
                    // Invalid move or clicking own piece to change selection
                    const targetPiece = game.get(square as any);
                    if (targetPiece && targetPiece.color === myColor) {
                        setSelectedSquare(square);
                    } else {
                        setSelectedSquare(null);
                    }
                }
            } catch (e) {
                setSelectedSquare(null);
            }
        } else {
            const piece = game.get(square as any);
            if (piece && piece.color === myColor) {
                setSelectedSquare(square);
            }
        }
    };

    const getPiecesImageUrl = (p: { type: string; color: string }) => {
        // Using a standard public assets set
        const color = p.color === 'w' ? 'white' : 'black';
        const types: Record<string, string> = {
            p: 'pawn', r: 'rook', n: 'knight', b: 'bishop', q: 'queen', k: 'king'
        };
        return `https://raw.githubusercontent.com/lichess-org/lila/master/public/piece/cardinal/${p.color.toUpperCase()}${p.type.toUpperCase()}.svg`;
    };

    const labels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const rows = myColor === 'w' ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];
    const cols = myColor === 'w' ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-6 w-full max-w-2xl px-4"
        >
            <div className="grid grid-cols-8 border-[6px] border-slate-800 shadow-2xl rounded-xl overflow-hidden bg-slate-900 ring-4 ring-slate-800/50">
                {rows.map((row) => (
                    <React.Fragment key={row}>
                        {cols.map((col) => {
                            const squareName = `${labels[col]}${8 - row}`;
                            const piece = board[row][col];
                            const isSelected = selectedSquare === squareName;
                            const isDark = (row + col) % 2 === 1;

                            return (
                                <motion.div
                                    key={squareName}
                                    layout
                                    onClick={() => handleSquareClick(squareName)}
                                    className={`w-full aspect-square flex items-center justify-center cursor-pointer transition-colors relative ${isDark ? 'bg-[#b58863]' : 'bg-[#f0d9b5]'
                                        } ${isSelected ? 'shadow-[inset_0_0_20px_rgba(99,102,241,0.6)] bg-primary/40' : ''}`}
                                >
                                    <AnimatePresence mode="popLayout">
                                        {piece && (
                                            <motion.img
                                                key={`${piece.type}-${piece.color}-${squareName}`}
                                                layoutId={`${piece.type}-${piece.color}`}
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                src={getPiecesImageUrl(piece)}
                                                alt={piece.type}
                                                className="w-10 h-10 md:w-12 md:h-12 drop-shadow-lg z-20 pointer-events-none"
                                            />
                                        )}
                                    </AnimatePresence>
                                    {/* Square label for a-file and 1-rank */}
                                    {col === 0 && (
                                        <span className={`absolute top-0.5 left-1 text-[8px] font-bold pointer-events-none ${isDark ? 'text-[#f0d9b5]' : 'text-[#b58863]'}`}>
                                            {8 - row}
                                        </span>
                                    )}
                                    {row === 7 && (
                                        <span className={`absolute bottom-0.5 right-1 text-[8px] font-bold pointer-events-none ${isDark ? 'text-[#f0d9b5]' : 'text-[#b58863]'}`}>
                                            {labels[col]}
                                        </span>
                                    )}
                                </motion.div>
                            );
                        })}
                    </React.Fragment>
                ))}
            </div>

            <div className="flex gap-4 w-full relative z-10">
                {players.map(p => (
                    <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex-1 p-5 rounded-2xl border-2 flex items-center gap-4 transition-all shadow-xl ${p.id === turnId
                            ? 'bg-primary/20 border-primary ring-4 ring-primary/20'
                            : 'bg-slate-900/60 border-white/5 opacity-80'}`}
                    >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black shadow-lg ${p.color === 'w' ? 'bg-white text-black' : 'bg-black text-white'}`}>
                            {p.color.toUpperCase()}
                        </div>
                        <div className="flex-1">
                            <div className="font-black text-lg tracking-tight">{p.name}</div>
                            <div className="text-[10px] text-slate-500 uppercase font-black bg-white/5 px-2 py-0.5 rounded-md w-fit">
                                {p.id === currentPlayerId ? 'Commander (You)' : 'Opponent'}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};
