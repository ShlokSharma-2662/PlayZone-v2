import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SnakesAndLaddersAction, SnakesAndLaddersState } from '../../games/snakesAndLadders';
import type { Player } from '../../shared/types';

interface SnakesAndLaddersBoardProps {
    state: SnakesAndLaddersState;
    roomPlayers: Player[];
    currentPlayerId: string;
    onAction: (action: SnakesAndLaddersAction) => void;
}

export const SnakesAndLaddersBoard: React.FC<SnakesAndLaddersBoardProps> = ({
    state,
    roomPlayers,
    currentPlayerId,
    onAction,
}) => {
    const isMyTurn = state.turnOrder[state.currentTurnIndex] === currentPlayerId;

    const getCellCoords = (pos: number) => {
        const row = Math.floor((pos - 1) / 10);
        const col = (pos - 1) % 10;
        const x = row % 2 === 0 ? col : 9 - col;
        const y = 9 - row;
        return { x: x * 10 + 5, y: y * 10 + 5 };
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center space-y-8 w-full max-w-4xl px-4"
        >
            <div className="relative aspect-square w-full max-w-[500px] bg-slate-900 rounded-[2.5rem] border-[6px] border-slate-800 shadow-2xl overflow-hidden p-2 ring-4 ring-slate-800/30">
                {/* Board Background Grid */}
                <div className="grid grid-cols-10 grid-rows-10 h-full w-full rounded-[1.5rem] overflow-hidden">
                    {Array.from({ length: 100 }).map((_, i) => {
                        const row = Math.floor(i / 10);
                        const col = i % 10;
                        const isReversed = row % 2 !== 0;
                        const cellNum = isReversed ? (9 - row) * 10 + (9 - col) + 1 : (9 - row) * 10 + col + 1;

                        return (
                            <div
                                key={i}
                                className={`border border-white/5 flex items-center justify-center text-[10px] font-black ${cellNum % 2 === 0 ? 'bg-slate-900/40' : 'bg-slate-950/40'
                                    }`}
                            >
                                <span className="opacity-10">{cellNum}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Players */}
                <AnimatePresence>
                    {Object.entries(state.positions).map(([pid, pos]) => {
                        const player = roomPlayers.find(p => p.id === pid);
                        const { x, y } = getCellCoords(pos);
                        return (
                            <motion.div
                                key={pid}
                                layout
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                    left: `${x}%`,
                                    top: `${y}%`,
                                }}
                                transition={{ type: "spring", damping: 15, stiffness: 200 }}
                                className="absolute w-[7%] h-[7%] rounded-full shadow-2xl z-20 border-2 border-white/40 flex items-center justify-center"
                                style={{
                                    backgroundColor: player?.color ?? '#fff',
                                    transform: 'translate(-50%, -50%)',
                                }}
                            >
                                <div className="w-full h-full rounded-full bg-gradient-to-tr from-black/20 to-white/20" />
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-black whitespace-nowrap border border-white/10 shadow-xl"
                                >
                                    {player?.name}
                                </motion.div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {state.winnerId && (
                    <motion.div
                        initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                        animate={{ opacity: 1, backdropFilter: 'blur(10px)' }}
                        className="absolute inset-0 bg-slate-950/60 z-30 flex items-center justify-center p-8"
                    >
                        <motion.div
                            initial={{ scale: 0.8, y: 30 }}
                            animate={{ scale: 1, y: 0 }}
                            className="glass-premium p-12 rounded-[3.5rem] border-2 border-primary/30 text-center shadow-primary/20 shadow-2xl"
                        >
                            <h2 className="text-5xl font-black text-primary italic tracking-tighter mb-2 uppercase">Ascended</h2>
                            <p className="text-2xl font-black text-white mb-8">
                                {roomPlayers.find(p => p.id === state.winnerId)?.name} reached the summit
                            </p>
                            <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.5em]">Victory Sequence</div>
                        </motion.div>
                    </motion.div>
                )}
            </div>

            <div className="glass-premium p-8 rounded-[2.5rem] w-full max-w-[500px] flex items-center justify-between gap-10 shadow-2xl ring-1 ring-white/10">
                <div className="flex-1 space-y-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase tracking-[0.4em] text-slate-500 font-black">Active Challenger</span>
                        <div className="flex items-center gap-3">
                            <motion.div
                                animate={isMyTurn ? { scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] } : {}}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="w-5 h-5 rounded-full shadow-lg"
                                style={{ backgroundColor: roomPlayers.find(p => p.id === state.turnOrder[state.currentTurnIndex])?.color }}
                            />
                            <span className="text-xl font-black text-white tracking-tight">
                                {roomPlayers.find(p => p.id === state.turnOrder[state.currentTurnIndex])?.name}
                                {isMyTurn && <span className="text-primary ml-2 uppercase text-[10px] tracking-widest">(You)</span>}
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
                        disabled={!isMyTurn || !!state.winnerId}
                        className="px-10 py-3 rounded-full bg-primary text-white font-black text-xs uppercase tracking-[0.3em] shadow-lg shadow-primary/20 disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none"
                    >
                        Cast Dice
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};
