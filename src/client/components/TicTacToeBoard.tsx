import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TicTacToeAction, TicTacToeState } from '../../games/tictactoe';

interface TicTacToeBoardProps {
    state: TicTacToeState;
    currentPlayerId: string;
    onAction: (action: TicTacToeAction) => void;
}

export const TicTacToeBoard: React.FC<TicTacToeBoardProps> = ({
    state,
    currentPlayerId,
    onAction,
}) => {
    const myIndex = state.players.findIndex(p => p.id === currentPlayerId);
    const isMyTurn = state.turnIndex === myIndex;
    const myMark = state.players[myIndex]?.mark;

    const handleCellClick = (index: number) => {
        if (!isMyTurn || state.board[index] || state.winnerId) return;
        onAction({ type: 'place', index });
    };

    const isDraw = state.winnerId === 'draw';

    return (
        <div className="flex flex-col items-center space-y-8">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="grid grid-cols-3 gap-4 w-full max-w-[400px]"
            >
                {state.board.map((cell, i) => {
                    const isWinningCell = state.winningLine?.includes(i);
                    return (
                        <motion.button
                            key={i}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleCellClick(i)}
                            disabled={!isMyTurn || !!cell || !!state.winnerId}
                            className={`aspect-square rounded-[2rem] text-5xl font-black flex items-center justify-center transition-all duration-500 border-2 shadow-2xl relative overflow-hidden ${cell === 'X' ? 'text-blue-400 bg-blue-500/10 border-blue-500/20 shadow-blue-500/10' :
                                cell === 'O' ? 'text-rose-400 bg-rose-500/10 border-rose-500/20 shadow-rose-500/10' :
                                    'bg-slate-900/40 border-white/5 hover:border-white/10'
                                } ${isWinningCell ? 'ring-4 ring-primary z-10 border-primary bg-primary/20 shadow-primary/20' : ''}`}
                        >
                            <AnimatePresence>
                                {cell && (
                                    <motion.span
                                        initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                        transition={{ type: "spring", damping: 12, stiffness: 200 }}
                                        className="inline-block drop-shadow-[0_0_15px_rgba(currentColor,0.5)]"
                                    >
                                        {cell}
                                    </motion.span>
                                )}
                            </AnimatePresence>
                            {isWinningCell && (
                                <motion.div
                                    layoutId="win-shimmer"
                                    className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0"
                                    animate={{ x: ['-100%', '100%'] }}
                                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                                />
                            )}
                        </motion.button>
                    );
                })}
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-premium p-10 rounded-[2.5rem] w-full max-w-[400px] text-center shadow-2xl relative overflow-hidden ring-1 ring-white/10"
            >
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-secondary to-primary opacity-50" />

                {state.winnerId && !isDraw ? (
                    <div className="space-y-4">
                        <motion.h3
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="text-4xl font-black text-primary italic tracking-tight uppercase"
                        >
                            Victory
                        </motion.h3>
                        <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">
                            {state.winnerId === currentPlayerId ? "The Arena is Yours" : "Honor in Defeat"}
                        </p>
                    </div>
                ) : isDraw ? (
                    <div className="space-y-4">
                        <h3 className="text-4xl font-black text-slate-400 italic tracking-tight uppercase">Stalemate</h3>
                        <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">A Balanced Conflict</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex flex-col items-center gap-2">
                            <span className="text-[10px] uppercase tracking-[0.5em] text-slate-500 font-black">Turn Phase</span>
                            <div className="flex items-center gap-6">
                                <motion.div
                                    animate={state.turnIndex === 0 ? { scale: 1.2, opacity: 1 } : { scale: 0.8, opacity: 0.3 }}
                                    className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 text-2xl font-black ${state.turnIndex === 0 ? 'text-blue-400 bg-blue-500/10 border-blue-500/30 shadow-lg shadow-blue-500/20' : 'text-slate-500 border-white/5'}`}
                                >
                                    X
                                </motion.div>
                                <div className="h-8 w-px bg-white/10" />
                                <motion.div
                                    animate={state.turnIndex === 1 ? { scale: 1.2, opacity: 1 } : { scale: 0.8, opacity: 0.3 }}
                                    className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 text-2xl font-black ${state.turnIndex === 1 ? 'text-rose-400 bg-rose-500/10 border-rose-500/30 shadow-lg shadow-rose-500/20' : 'text-slate-500 border-white/5'}`}
                                >
                                    O
                                </motion.div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <div className="text-white text-xl font-black uppercase tracking-tighter italic">
                                {state.players[state.turnIndex].id === currentPlayerId ? "Deploy Your Mark" : "Awaiting Command"}
                            </div>
                            {isMyTurn && (
                                <motion.div
                                    animate={{ opacity: [0.3, 1, 0.3] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                    className="text-[10px] text-primary font-black uppercase tracking-[0.4em] mt-2"
                                >
                                    Your Turn Now
                                </motion.div>
                            )}
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};
