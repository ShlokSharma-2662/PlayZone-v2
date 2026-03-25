import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Player, Room } from '../../shared/types';

interface LobbyProps {
    room: Room;
    currentPlayerId: string;
    onToggleReady: () => void;
    onStartGame: () => void;
    onSwitchGame: (game: any) => void;
    onKickPlayer: (playerId: string) => void;
    canStart: boolean;
}

export const Lobby: React.FC<LobbyProps> = ({
    room,
    currentPlayerId,
    onToggleReady,
    onStartGame,
    onSwitchGame,
    onKickPlayer,
    canStart,
}) => {
    const isHost = room.hostId === currentPlayerId;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="md:col-span-1 space-y-6"
            >
                <div className="glass-premium p-6 rounded-3xl space-y-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16" />

                    <h2 className="text-xl font-black border-b border-white/5 pb-3 text-primary tracking-tighter italic">Room Config</h2>
                    <div className="space-y-3">
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold ml-1">Access Token</p>
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="group relative cursor-copy"
                            onClick={() => {
                                navigator.clipboard.writeText(room.code);
                                // Optional: add toast notification here
                            }}
                        >
                            <div className="text-3xl font-mono font-black text-white bg-slate-950/80 p-5 rounded-2xl text-center border-2 border-white/10 group-hover:border-primary/50 transition-all shadow-inner">
                                {room.code}
                            </div>
                            <div className="absolute -top-1 -right-1 flex h-4 w-4">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-primary shadow-lg shadow-primary/50"></span>
                            </div>
                        </motion.div>
                        <p className="text-[9px] text-slate-500 text-center uppercase font-black tracking-widest">Tap to copy and invite</p>
                    </div>

                    <div className="space-y-3 pt-4">
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-extrabold ml-1">Selection</p>
                        <div className="relative group">
                            <select
                                className="input-field w-full py-4 bg-slate-900 border-2 border-white/5 text-white font-black rounded-2xl appearance-none cursor-pointer hover:border-primary/50 transition-all shadow-xl pr-10"
                                value={room.game}
                                onChange={(e) => onSwitchGame(e.target.value)}
                                disabled={!isHost}
                            >
                                <option value="chess">♟️ Chess Masters</option>
                                <option value="snake">🐍 Snake Arena</option>
                                <option value="tictactoe">⭕ Ultimate TicTacToe</option>
                                <option value="snakes_and_ladders">🪜 Snakes & Ladders</option>
                                <option value="ludo">🎲 Epic Ludo</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 group-hover:text-primary transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass-premium p-6 rounded-3xl shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-secondary animate-pulse"></div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onToggleReady}
                        className={`w-full py-5 rounded-2xl font-black uppercase tracking-tighter transition-all shadow-xl border-2 ${room.players.find(p => p.id === currentPlayerId)?.isReady
                            ? 'bg-green-500/10 text-green-400 border-green-500/30'
                            : 'bg-primary text-primary-foreground border-transparent hover:shadow-primary/30'
                            }`}
                    >
                        {room.players.find(p => p.id === currentPlayerId)?.isReady ? '✅ CONFIRMED' : '🔥 READY UP'}
                    </motion.button>

                    {isHost && (
                        <motion.button
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={canStart ? { scale: 1.02 } : {}}
                            whileTap={canStart ? { scale: 0.98 } : {}}
                            onClick={onStartGame}
                            disabled={!canStart}
                            className={`w-full mt-4 py-5 rounded-2xl font-black uppercase tracking-tighter transition-all shadow-xl border-2 ${canStart
                                ? 'bg-secondary text-secondary-foreground border-transparent shadow-secondary/30'
                                : 'bg-slate-900 text-slate-600 border-white/5 opacity-50 cursor-not-allowed'}`}
                        >
                            🚀 LAUNCH SESSION
                        </motion.button>
                    )}
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="md:col-span-2 glass-premium p-8 rounded-[2.5rem] min-h-[500px] shadow-2xl relative overflow-hidden"
            >
                <div className="flex justify-between items-end mb-10 relative z-10">
                    <div>
                        <h2 className="text-4xl font-black tracking-tighter italic flex items-center gap-4">
                            Lobby <span className="text-sm font-black text-primary bg-primary/10 px-4 py-1.5 rounded-2xl border border-primary/20">{room.players.length} / 5</span>
                        </h2>
                        <p className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest mt-1 ml-1">Waiting for crew...</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 relative z-10">
                    <AnimatePresence mode="popLayout">
                        {room.players.map((player) => (
                            <motion.div
                                key={player.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, x: -20 }}
                                className={`p-5 rounded-[1.5rem] border-2 flex items-center justify-between group transition-all relative overflow-hidden shadow-lg ${player.id === currentPlayerId
                                    ? 'bg-primary/10 border-primary/30'
                                    : 'bg-slate-900/60 border-white/5 hover:border-white/10'
                                    }`}
                            >
                                {player.id === currentPlayerId && (
                                    <div className="absolute left-0 top-0 h-full w-1.5 bg-primary shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
                                )}

                                <div className="flex items-center gap-5 z-10">
                                    <motion.div
                                        whileHover={{ rotate: 12, scale: 1.1 }}
                                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black shadow-2xl"
                                        style={{
                                            backgroundColor: player.color ?? '#334155',
                                            boxShadow: `0 0 20px -5px ${player.color ?? '#334155'}80`
                                        }}
                                    >
                                        {player.name[0].toUpperCase()}
                                    </motion.div>
                                    <div>
                                        <div className="font-black text-xl flex items-center gap-3">
                                            {player.name}
                                            <div className="flex gap-1">
                                                {player.id === room.hostId && <span className="text-[8px] bg-secondary/20 text-secondary border border-secondary/30 px-2 py-0.5 rounded-lg uppercase leading-none font-black">Host</span>}
                                                {player.id === currentPlayerId && <span className="text-[8px] bg-primary/20 text-primary px-2 py-0.5 rounded-lg uppercase leading-none font-black italic border border-primary/30">You</span>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 mt-1.5">
                                            <div className={`flex items-center gap-1.5 text-[10px] uppercase font-black ${player.isConnected ? 'text-green-500' : 'text-slate-500'}`}>
                                                <span className={`w-2 h-2 rounded-full ${player.isConnected ? 'bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-slate-700'}`}></span>
                                                {player.isConnected ? 'Synchronized' : 'Offline'}
                                            </div>
                                            <div className="text-[10px] text-slate-400 font-black uppercase tracking-tight bg-white/5 px-2 py-0.5 rounded-md">
                                                Wins: <span className="text-white font-black ml-1">{player.score || 0}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 z-10">
                                    <motion.div
                                        animate={player.isReady ? { scale: [1, 1.05, 1] } : {}}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 ${player.isReady ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-slate-950/50 text-slate-600 border-white/5'
                                            }`}
                                    >
                                        {player.isReady ? 'READY' : 'WAITING'}
                                    </motion.div>
                                    {isHost && player.id !== currentPlayerId && (
                                        <motion.button
                                            whileHover={{ scale: 1.1, backgroundColor: '#ef4444' }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => onKickPlayer(player.id)}
                                            className="p-2.5 rounded-xl bg-red-500/10 text-red-500 transition-all shadow-lg"
                                            title="Kick Player"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                            </svg>
                                        </motion.button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {Array.from({ length: 5 - room.players.length }).map((_, i) => (
                        <div key={`empty-${i}`} className="p-5 rounded-[1.5rem] border-2 border-dashed border-slate-800/50 flex items-center gap-5 opacity-20 grayscale transition-all hover:opacity-30">
                            <div className="w-14 h-14 rounded-2xl bg-slate-800/40" />
                            <div className="space-y-2">
                                <div className="h-5 w-32 bg-slate-800/40 rounded-lg" />
                                <div className="h-3 w-48 bg-slate-800/20 rounded-lg" />
                            </div>
                        </div>
                    ))}
                </div>

                {!canStart && isHost && room.players.length < 2 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-10 p-5 bg-primary/5 border-2 border-primary/20 rounded-3xl text-primary/80 text-xs flex gap-4 italic items-center shadow-inner"
                    >
                        <div className="p-2 bg-primary/10 rounded-xl">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0116 0z" />
                            </svg>
                        </div>
                        <span className="font-bold tracking-tight">Recruit your team! Share the code with at least one friend to unlock the launch button.</span>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};
