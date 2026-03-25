import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Room } from '../../shared/types';

interface GameShellProps {
    room: Room;
    currentPlayerId: string;
    statusText?: string;
    onLeave: () => void;
    children: React.ReactNode;
}

export const GameShell: React.FC<GameShellProps> = ({
    room,
    currentPlayerId,
    statusText,
    onLeave,
    children,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-4 gap-8"
        >
            <div className="lg:col-span-1 space-y-6 order-2 lg:order-1">
                <div className="glass-premium p-6 rounded-3xl space-y-6">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                        <h2 className="font-black text-xl tracking-tight italic uppercase text-primary">Arena</h2>
                        <div className="px-3 py-1 bg-white/5 rounded-full text-[10px] text-slate-400 font-black uppercase tracking-widest border border-white/5">
                            {room.game.replace('_', ' ')}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {room.players.map((player) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={player.id}
                                    className={`p-4 rounded-2xl flex items-center gap-4 border-2 transition-all shadow-xl ${player.id === currentPlayerId ? 'bg-primary/20 border-primary/40' : 'bg-slate-900/60 border-white/5'
                                        }`}
                                >
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shadow-[0_0_15px_rgba(0,0,0,0.3)] ring-2 ring-white/10"
                                        style={{ backgroundColor: player.color ?? '#334155' }}
                                    >
                                        {player.name[0].toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-black text-sm truncate tracking-tight">{player.name}</div>
                                        <div className="flex items-center gap-1.5">
                                            <div className={`w-1.5 h-1.5 rounded-full ${player.isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                                            <div className={`text-[9px] uppercase font-black tracking-widest ${player.isConnected ? 'text-green-500/80' : 'text-red-500/80'}`}>
                                                {player.isConnected ? 'Active' : 'Missing'}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onLeave}
                        className="w-full py-4 rounded-2xl border-2 border-red-500/30 text-red-500 hover:bg-red-500/20 transition-all font-black text-xs uppercase tracking-[0.2em] mt-6 shadow-lg shadow-red-500/10"
                    >
                        Abandon Match
                    </motion.button>
                </div>
            </div>

            <div className="lg:col-span-3 order-1 lg:order-2 space-y-6">
                <div className="glass-premium p-1 rounded-[2.5rem] min-h-[600px] flex flex-col items-center justify-center relative shadow-2xl ring-1 ring-white/10">
                    <div className="absolute inset-[1px] bg-slate-950/20 rounded-[2.5rem] -z-10" />

                    {/* Turn Timer Bar */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-slate-950/50 overflow-hidden rounded-t-[2.5rem]">
                        <motion.div
                            initial={{ width: '0%' }}
                            animate={{ width: '100%' }}
                            transition={{ duration: 15, ease: "linear" }}
                            className="h-full bg-gradient-to-r from-primary via-secondary to-primary shadow-[0_0_15px_#3D5AFE]"
                        />
                    </div>

                    <div className="absolute top-6 right-10 bg-slate-900/80 backdrop-blur-xl px-4 py-2 rounded-2xl border border-white/10 shadow-2xl z-20 flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Clock</span>
                        <span className="text-lg font-black text-white font-mono leading-none">15s</span>
                    </div>

                    {statusText && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="absolute top-6 left-10 bg-primary/20 backdrop-blur-xl px-4 py-2 rounded-2xl border border-primary/30 z-20 flex items-center gap-2"
                        >
                            <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                            <span className="text-[10px] font-black uppercase text-primary tracking-[0.2em]">{statusText}</span>
                        </motion.div>
                    )}

                    {/* Background Decoration */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -mr-48 -mt-48 transition-all duration-1000" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-[100px] -ml-48 -mb-48 transition-all duration-1000" />

                    <div className="relative z-10 w-full flex flex-col items-center py-12">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={room.game}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                transition={{ duration: 0.4 }}
                                className="w-full flex flex-col items-center"
                            >
                                {children}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
