import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LudoAction, LudoState } from '../../games/ludo';
import type { Player } from '../../shared/types';

interface LudoBoardProps {
    state: LudoState;
    roomPlayers: Player[];
    currentPlayerId: string;
    onAction: (action: LudoAction) => void;
}

export const LudoBoard: React.FC<LudoBoardProps> = ({
    state,
    roomPlayers,
    currentPlayerId,
    onAction,
}) => {
    const isMyTurn = state.turnOrder[state.currentTurnIndex] === currentPlayerId;
    const myPlayer = roomPlayers.find(p => p.id === currentPlayerId);

    // Simple 15x15 Ludo Board representation
    const renderGrid = () => {
        const cells = [];
        for (let r = 0; r < 15; r++) {
            for (let c = 0; c < 15; c++) {
                let type: 'base' | 'path' | 'home' | 'safe' = 'path';
                let color = '';

                // Determine cell types and colors (Simplified)
                if (r < 6 && c < 6) { type = 'base'; color = 'bg-red-500/10 border-red-500/5'; }
                else if (r < 6 && c > 8) { type = 'base'; color = 'bg-green-500/10 border-green-500/5'; }
                else if (r > 8 && c < 6) { type = 'base'; color = 'bg-blue-500/10 border-blue-500/5'; }
                else if (r > 8 && c > 8) { type = 'base'; color = 'bg-yellow-500/10 border-yellow-500/5'; }
                else if (r >= 6 && r <= 8 && c >= 6 && c <= 8) { type = 'home'; color = 'bg-white/5 border-white/10'; }

                cells.push(
                    <div key={`${r}-${c}`} className={`border border-white/5 ${color} flex items-center justify-center relative`}>
                    </div>
                );
            }
        }
        return cells;
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center space-y-8 w-full max-w-4xl px-4"
        >
            <div className="relative aspect-square w-full max-w-[500px] bg-slate-900 rounded-[2.5rem] border-[6px] border-slate-800 shadow-2xl overflow-hidden p-2 ring-4 ring-slate-800/30">
                <div className="grid grid-cols-15 grid-rows-15 h-full w-full rounded-[1.5rem] overflow-hidden">
                    {renderGrid()}
                </div>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.5em] opacity-20 italic">Strategic Nexus</p>
                </div>

                {isMyTurn && state.lastRoll !== null && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 pointer-events-auto z-40 bg-slate-950/80 backdrop-blur-xl p-3 rounded-2xl border border-white/10 shadow-2xl"
                    >
                        {state.tokenPositions[currentPlayerId].map((pos, idx) => (
                            <motion.button
                                key={idx}
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onAction({ type: 'move', tokenIndex: idx })}
                                disabled={(pos === -1 && state.lastRoll !== 6) || (pos !== -1 && pos + (state.lastRoll ?? 0) > 56)}
                                className="px-4 py-2 rounded-xl bg-primary text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none transition-all"
                            >
                                Token {idx + 1}
                            </motion.button>
                        ))}
                    </motion.div>
                )}

                {state.winnerId && (
                    <motion.div
                        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        animate={{ opacity: 1, backdropFilter: 'blur(10px)' }}
                        className="absolute inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-8"
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            className="glass-premium p-12 rounded-[3.5rem] border-2 border-primary/30 text-center shadow-primary/20 shadow-2xl"
                        >
                            <h2 className="text-5xl font-black text-primary italic tracking-tighter mb-2 uppercase">Imperator</h2>
                            <p className="text-2xl font-black text-white mb-8">
                                {roomPlayers.find(p => p.id === state.winnerId)?.name} seized ultimate control
                            </p>
                            <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.5em]">Victory sequence completed</div>
                        </motion.div>
                    </motion.div>
                )}
            </div>

            <div className="glass-premium p-8 rounded-[2.5rem] w-full max-w-[500px] flex items-center justify-between gap-10 shadow-2xl ring-1 ring-white/10">
                <div className="flex-1 space-y-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-slate-500 font-black">Current Strategist</span>
                        <div className="flex items-center gap-3">
                            <motion.div
                                animate={isMyTurn ? { scale: [1, 1.1, 1], boxShadow: ["0 0 0px #fff", "0 0 20px #fff", "0 0 0px #fff"] } : {}}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="w-5 h-5 rounded-full shadow-lg border border-white/20"
                                style={{ backgroundColor: roomPlayers.find(p => p.id === state.turnOrder[state.currentTurnIndex])?.color }}
                            />
                            <span className="text-xl font-black text-white tracking-tight italic uppercase">
                                {roomPlayers.find(p => p.id === state.turnOrder[state.currentTurnIndex])?.name}
                                {isMyTurn && <span className="text-primary ml-2 text-[10px] tracking-[0.2em] font-black leading-none">(Primary)</span>}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-4">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={state.lastRoll || 'none'}
                            initial={{ scale: 0.5, rotate: -45, opacity: 0 }}
                            animate={{ scale: 1, rotate: 0, opacity: 1 }}
                            className="text-5xl font-black p-6 rounded-[1.5rem] bg-slate-950 border-2 border-white/5 w-20 h-20 flex items-center justify-center shadow-2xl text-primary italic"
                        >
                            {state.lastRoll ?? '?'}
                        </motion.div>
                    </AnimatePresence>
                    <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onAction({ type: 'roll' })}
                        disabled={!isMyTurn || (state.lastRoll !== null && state.tokenPositions[currentPlayerId].every(p => !((p === -1 && state.lastRoll === 6) || (p !== -1 && p + state.lastRoll! <= 56))))}
                        className="px-12 py-3 rounded-full bg-primary text-white font-black text-xs uppercase tracking-[0.3em] shadow-lg shadow-primary/20 disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none"
                    >
                        Action
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};
