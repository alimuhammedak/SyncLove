/**
 * Guessing Panel Component
 * Input for guesses and reaction icons
 */

import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send } from 'lucide-react';
import { REACTION_ICONS } from '../utils/emotions';
import type { GuessResult } from '../hooks/useEmotionGame';

interface GuessingPanelProps {
    onSubmitGuess: (guess: string) => void;
    onSendReaction: (reaction: string) => void;
    guesses: GuessResult[];
    disabled?: boolean;
}

export default function GuessingPanel({ onSubmitGuess, onSendReaction, guesses, disabled }: GuessingPanelProps) {
    const [guessText, setGuessText] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (guessText.trim() && !disabled) {
            onSubmitGuess(guessText.trim());
            setGuessText('');
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Guess history */}
            <div className="flex-1 overflow-y-auto space-y-2 mb-4 p-3 rounded-xl bg-white/5">
                <AnimatePresence>
                    {guesses.length === 0 ? (
                        <p className="text-center text-white/40 py-8 text-sm">
                            Henüz tahmin yok...
                        </p>
                    ) : (
                        guesses.map((guess, i) => (
                            <motion.div
                                key={`${guess.playerId}-${guess.guessedAt}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className={`p-3 rounded-lg ${guess.isExactMatch
                                        ? 'bg-green-500/20 border border-green-500/40'
                                        : guess.resonanceScore > 0
                                            ? 'bg-yellow-500/20 border border-yellow-500/30'
                                            : 'bg-white/5 border border-white/10'
                                    }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-white">
                                        {guess.guessText}
                                    </span>
                                    {guess.isExactMatch ? (
                                        <span className="text-green-400 font-bold text-sm">
                                            ✓ Doğru!
                                        </span>
                                    ) : guess.resonanceScore > 0 ? (
                                        <span className="text-yellow-400 text-sm">
                                            +{guess.resonanceScore} rezonans
                                        </span>
                                    ) : null}
                                </div>
                                <p className="text-xs text-white/40 mt-1">
                                    {new Date(guess.guessedAt).toLocaleTimeString('tr-TR')}
                                </p>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Reaction icons */}
            <div className="flex justify-center gap-2 mb-4">
                {REACTION_ICONS.map(reaction => (
                    <motion.button
                        key={reaction.id}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onSendReaction(reaction.id)}
                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xl transition-colors"
                        title={reaction.label}
                    >
                        {reaction.emoji}
                    </motion.button>
                ))}
            </div>

            {/* Guess input */}
            <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                    type="text"
                    value={guessText}
                    onChange={e => setGuessText(e.target.value)}
                    placeholder="Duyguyu tahmin et..."
                    disabled={disabled}
                    className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent transition-all disabled:opacity-50"
                />
                <motion.button
                    type="submit"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={disabled || !guessText.trim()}
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                >
                    <Send size={20} />
                </motion.button>
            </form>
        </div>
    );
}
