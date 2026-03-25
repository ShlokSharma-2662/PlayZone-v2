import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SnakeAction, SnakeState } from '../../games/snake';
import type { Player } from '../../shared/types';

interface SnakeBoardProps {
    state: SnakeState;
    roomPlayers: Player[];
    currentPlayerId: string;
    onAction: (action: SnakeAction) => void;
}

export const SnakeBoard: React.FC<SnakeBoardProps> = ({
    state,
    roomPlayers,
    currentPlayerId,
    onAction,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            let dx = 0, dy = 0;
            switch (e.key) {
                case 'ArrowUp': dy = -1; break;
                case 'ArrowDown': dy = 1; break;
                case 'ArrowLeft': dx = -1; break;
                case 'ArrowRight': dx = 1; break;
                default: return;
            }
            onAction({ type: 'direction', dx, dy });
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onAction]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const size = canvas.width;
        const cellSize = size / state.gridSize;

        // Clear board with deep slate
        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, size, size);

        // Draw grid lines (subtle)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= state.gridSize; i++) {
            ctx.beginPath();
            ctx.moveTo(i * cellSize, 0);
            ctx.lineTo(i * cellSize, size);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i * cellSize);
            ctx.lineTo(size, i * cellSize);
            ctx.stroke();
        }

        // Draw food with inner glow
        state.food.forEach((f) => {
            const foodX = f.x * cellSize + cellSize / 2;
            const foodY = f.y * cellSize + cellSize / 2;
            const gradient = ctx.createRadialGradient(foodX, foodY, 2, foodX, foodY, cellSize / 2);
            gradient.addColorStop(0, '#fda4af');
            gradient.addColorStop(1, '#f43f5e');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(foodX, foodY, cellSize / 2.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.shadowBlur = 15;
            ctx.shadowColor = 'rgba(244, 63, 94, 0.6)';
            ctx.stroke();
            ctx.shadowBlur = 0;
        });

        // Draw snakes
        Object.entries(state.snakes).forEach(([id, snake]) => {
            if (!snake.alive) return;
            const player = roomPlayers.find(p => p.id === id);
            const color = player?.color ?? '#fff';

            ctx.fillStyle = color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = color;

            snake.body.forEach((p, index) => {
                const x = p.x * cellSize;
                const y = p.y * cellSize;
                const padding = index === 0 ? 2 : 4;
                const radius = index === 0 ? 6 : 4;

                ctx.beginPath();
                ctx.roundRect(x + padding, y + padding, cellSize - padding * 2, cellSize - padding * 2, radius);
                ctx.fill();

                // Add eyes to head
                if (index === 0) {
                    ctx.fillStyle = '#000';
                    ctx.shadowBlur = 0;
                    ctx.beginPath();
                    ctx.arc(x + cellSize / 3, y + cellSize / 3, 2, 0, Math.PI * 2);
                    ctx.arc(x + 2 * cellSize / 3, y + cellSize / 3, 2, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.fillStyle = color;
                }
            });
            ctx.shadowBlur = 0;
        });
    }, [state, roomPlayers]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center space-y-8 w-full max-w-4xl px-4"
        >
            <div className="relative aspect-square w-full max-w-[500px] glass-premium rounded-[2.5rem] border-4 border-slate-800 shadow-2xl overflow-hidden p-3 ring-4 ring-slate-800/30">
                <canvas
                    ref={canvasRef}
                    width={600}
                    height={600}
                    className="w-full h-full rounded-[1.5rem]"
                />

                <AnimatePresence>
                    {state.winnerId && (
                        <motion.div
                            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                            animate={{ opacity: 1, backdropFilter: 'blur(8px)' }}
                            className="absolute inset-0 bg-slate-950/60 flex flex-col items-center justify-center p-8 text-center"
                        >
                            <motion.div
                                initial={{ scale: 0.8, y: 20 }}
                                animate={{ scale: 1, y: 0 }}
                                className="glass-premium p-10 rounded-[3rem] border-2 border-primary/30 shadow-primary/20 shadow-2xl"
                            >
                                <h2 className="text-5xl font-black text-primary italic tracking-tighter mb-2 uppercase">Apex Predator</h2>
                                <p className="text-2xl font-black text-white mb-8 tracking-tight">
                                    {roomPlayers.find(p => p.id === state.winnerId)?.name} dominated the arena
                                </p>
                                <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em]">Final Result</div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-[500px]">
                {roomPlayers.map(p => {
                    const snake = state.snakes[p.id];
                    return (
                        <motion.div
                            key={p.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`glass-premium p-4 rounded-2xl border-2 transition-all shadow-xl ${snake?.alive ? 'border-white/5 bg-slate-900/40' : 'border-red-500/30 bg-red-500/5 grayscale'}`}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-3 h-3 rounded-full shadow-[0_0_10px_rgba(currentColor,0.5)]" style={{ backgroundColor: p.color }} />
                                <span className="text-[10px] font-black uppercase tracking-[0.1em] truncate text-slate-400">
                                    {p.name} {p.id === currentPlayerId ? '(You)' : ''}
                                </span>
                            </div>
                            <div className="text-2xl font-black text-white tracking-tighter italic">{snake?.score ?? 0}</div>
                        </motion.div>
                    );
                })}
            </div>

            <motion.div
                animate={{ opacity: [0.4, 0.8, 0.4] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] flex items-center gap-4"
            >
                <span className="w-8 h-px bg-white/10" />
                Navigate with Arrow Keys
                <span className="w-8 h-px bg-white/10" />
            </motion.div>
        </motion.div>
    );
};
