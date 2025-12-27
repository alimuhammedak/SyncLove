/**
 * Timer Display Component
 * Circular countdown timer for rounds
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface TimerDisplayProps {
    timeLimit: number;
    startedAt: string | Date;
    onTimeUp?: () => void;
    isPaused?: boolean;
}

export default function TimerDisplay({ timeLimit, startedAt, onTimeUp, isPaused }: TimerDisplayProps) {
    const [timeRemaining, setTimeRemaining] = useState(timeLimit);

    useEffect(() => {
        if (isPaused) return;

        const startTime = new Date(startedAt).getTime();

        const interval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            const remaining = Math.max(0, timeLimit - elapsed);
            setTimeRemaining(remaining);

            if (remaining === 0) {
                clearInterval(interval);
                onTimeUp?.();
            }
        }, 100);

        return () => clearInterval(interval);
    }, [timeLimit, startedAt, onTimeUp, isPaused]);

    const percentage = (timeRemaining / timeLimit) * 100;
    const circumference = 2 * Math.PI * 45; // radius = 45
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const getColor = () => {
        if (percentage > 50) return '#34c759';
        if (percentage > 25) return '#ff9500';
        return '#ff3b30';
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="relative inline-flex items-center justify-center">
            {/* Background circle */}
            <svg width="100" height="100" className="transform -rotate-90">
                <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="8"
                />
                {/* Progress circle */}
                <motion.circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={getColor()}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 0.1 }}
                />
            </svg>

            {/* Time text */}
            <div className="absolute inset-0 flex items-center justify-center">
                <motion.span
                    key={timeRemaining}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-2xl font-bold tabular-nums"
                    style={{ color: getColor() }}
                >
                    {formatTime(timeRemaining)}
                </motion.span>
            </div>

            {/* Pulse effect when low */}
            {timeRemaining <= 10 && timeRemaining > 0 && (
                <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ backgroundColor: getColor() }}
                    animate={{ opacity: [0, 0.2, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                />
            )}
        </div>
    );
}
