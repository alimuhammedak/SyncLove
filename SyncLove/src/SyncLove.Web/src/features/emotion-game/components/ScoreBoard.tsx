/**
 * ScoreBoard Component
 * Displays player scores with emotional resonance
 */

import { motion } from 'framer-motion';
import { Trophy, Sparkles, Target, Heart } from 'lucide-react';
import type { PlayerScore } from '../hooks/useEmotionGame';

interface ScoreBoardProps {
    scores: PlayerScore[];
    currentPlayerId?: string;
    compact?: boolean;
}

export default function ScoreBoard({ scores, currentPlayerId, compact = false }: ScoreBoardProps) {
    const sortedScores = [...scores].sort((a, b) => b.totalScore - a.totalScore);

    if (compact) {
        return (
            <div className="flex items-center gap-4 px-4 py-2 rounded-full bg-black/40 backdrop-blur-sm">
                {sortedScores.slice(0, 3).map((score, index) => (
                    <div
                        key={score.playerId}
                        className={`flex items-center gap-2 ${score.playerId === currentPlayerId ? 'text-yellow-400' : 'text-white/80'
                            }`}
                    >
                        {index === 0 && <Trophy size={16} className="text-yellow-500" />}
                        <span className="font-medium">{score.displayName}</span>
                        <span className="text-sm opacity-60">{score.totalScore}</span>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Trophy className="text-yellow-500" size={20} />
                Skor Tablosu
            </h3>

            <div className="space-y-3">
                {sortedScores.map((score, index) => (
                    <motion.div
                        key={score.playerId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-3 rounded-xl ${score.playerId === currentPlayerId
                                ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30'
                                : 'bg-white/5'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            {/* Rank */}
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${index === 0
                                        ? 'bg-yellow-500 text-black'
                                        : index === 1
                                            ? 'bg-gray-400 text-black'
                                            : index === 2
                                                ? 'bg-amber-700 text-white'
                                                : 'bg-white/10 text-white/60'
                                    }`}
                            >
                                {index + 1}
                            </div>

                            {/* Player info */}
                            <div className="flex-1">
                                <p className="font-medium text-white">{score.displayName}</p>
                                <div className="flex items-center gap-3 text-xs text-white/50 mt-1">
                                    <span className="flex items-center gap-1">
                                        <Target size={12} />
                                        {score.correctGuesses} doğru
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Heart size={12} className="text-pink-400" />
                                        {score.resonancePoints} rezonans
                                    </span>
                                </div>
                            </div>

                            {/* Score */}
                            <div className="text-right">
                                <p className="text-2xl font-bold text-white">{score.totalScore}</p>
                                <p className="text-xs text-white/40">puan</p>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {scores.length === 0 && (
                <div className="text-center py-8 text-white/40">
                    <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Henüz skor yok</p>
                </div>
            )}
        </div>
    );
}
