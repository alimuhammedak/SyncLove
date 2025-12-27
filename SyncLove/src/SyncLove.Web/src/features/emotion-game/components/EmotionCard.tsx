/**
 * Emotion Card Component
 * Displays emotion options for the drawer to select from
 */

import { motion } from 'framer-motion';
import { DIFFICULTY_COLORS, DIFFICULTY_LABELS, DIFFICULTY_POINTS, type EmotionDifficulty } from '../utils/emotions';
import { Sparkles, Zap, Flame, Crown } from 'lucide-react';

interface EmotionOption {
    emotion: string;
    category: string;
    difficulty: EmotionDifficulty;
}

interface EmotionCardProps {
    option: EmotionOption;
    index: number;
    onSelect: (emotion: string) => void;
    disabled?: boolean;
}

const DifficultyIcon = ({ difficulty }: { difficulty: EmotionDifficulty }) => {
    const iconClass = "w-5 h-5";
    switch (difficulty) {
        case 'Easy': return <Sparkles className={iconClass} />;
        case 'Medium': return <Zap className={iconClass} />;
        case 'Hard': return <Flame className={iconClass} />;
        case 'Legendary': return <Crown className={iconClass} />;
    }
};

export default function EmotionCard({ option, index, onSelect, disabled }: EmotionCardProps) {
    const difficultyColor = DIFFICULTY_COLORS[option.difficulty];
    const difficultyLabel = DIFFICULTY_LABELS[option.difficulty];
    const points = DIFFICULTY_POINTS[option.difficulty];

    return (
        <motion.button
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: disabled ? 1 : 1.05 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            onClick={() => !disabled && onSelect(option.emotion)}
            disabled={disabled}
            className={`relative overflow-hidden rounded-2xl p-6 text-left transition-all duration-300 ${disabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer hover:shadow-2xl hover:shadow-white/10'
                }`}
            style={{
                background: `linear-gradient(135deg, ${difficultyColor}15 0%, ${difficultyColor}05 100%)`,
                border: `1px solid ${difficultyColor}40`,
            }}
        >
            {/* Glow effect */}
            <div
                className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500"
                style={{
                    background: `radial-gradient(circle at 50% 50%, ${difficultyColor}20 0%, transparent 70%)`,
                }}
            />

            {/* Content */}
            <div className="relative z-10">
                {/* Difficulty badge */}
                <div
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mb-3"
                    style={{
                        backgroundColor: `${difficultyColor}20`,
                        color: difficultyColor,
                    }}
                >
                    <DifficultyIcon difficulty={option.difficulty} />
                    {difficultyLabel}
                </div>

                {/* Emotion text */}
                <h3 className="text-2xl font-bold text-white mb-2">
                    {option.emotion}
                </h3>

                {/* Category */}
                <p className="text-sm text-white/60 mb-4">
                    {option.category}
                </p>

                {/* Points */}
                <div className="flex items-center gap-2">
                    <span className="text-lg font-bold" style={{ color: difficultyColor }}>
                        +{points}
                    </span>
                    <span className="text-xs text-white/40">puan</span>
                </div>
            </div>

            {/* Decorative corner */}
            <div
                className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full opacity-20"
                style={{ backgroundColor: difficultyColor }}
            />
        </motion.button>
    );
}
