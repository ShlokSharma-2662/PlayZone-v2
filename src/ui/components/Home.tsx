import React from 'react';
import { motion } from 'framer-motion';

interface HomeProps {
    playerName: string;
    setPlayerName: (name: string) => void;
    roomCode: string;
    setRoomCode: (code: string) => void;
    onCreateRoom: () => void;
    onJoinRoom: () => void;
}

export const Home: React.FC<HomeProps> = ({
    playerName,
    setPlayerName,
    roomCode,
    setRoomCode,
    onCreateRoom,
    onJoinRoom,
}) => {
    const containerVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                ease: "easeOut" as any,
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: { opacity: 1, scale: 1 },
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center justify-center min-h-[60vh]"
        >
            <div className="glass-premium w-full max-w-lg p-8 rounded-[2rem] space-y-8 shadow-2xl relative overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl -mr-16 -mt-16" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/10 blur-3xl -ml-16 -mb-16" />

                <motion.div variants={itemVariants} className="text-center space-y-3">
                    <h1 className="text-5xl font-black tracking-tighter italic">
                        Welcome to <span className="text-gradient">PlayZone</span>
                    </h1>
                    <p className="text-slate-400 font-medium">The ultimate playground for classic games.</p>
                </motion.div>

                <div className="space-y-6 relative z-10">
                    <motion.div variants={itemVariants} className="space-y-2">
                        <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Your Alias</label>
                        <input
                            type="text"
                            className="input-field w-full text-lg focus:ring-4"
                            placeholder="How should friends see you?"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                        />
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        <motion.button
                            variants={itemVariants}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={onCreateRoom}
                            className="btn-primary w-full py-4 text-lg shadow-primary/30"
                        >
                            Host Game
                        </motion.button>
                        <motion.div variants={itemVariants} className="flex flex-col gap-2">
                            <input
                                type="text"
                                className="input-field w-full uppercase text-center font-mono font-black tracking-[0.3em] py-4"
                                placeholder="ROOM CODE"
                                maxLength={6}
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value)}
                            />
                            <motion.button
                                whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onJoinRoom}
                                className="btn-secondary w-full py-4"
                            >
                                Enter Room
                            </motion.button>
                        </motion.div>
                    </div>
                </div>

                <motion.div variants={itemVariants} className="pt-4 text-center">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                        Zero setup • Zero friction • Full fun
                    </p>
                </motion.div>
            </div>
        </motion.div>
    );
};
