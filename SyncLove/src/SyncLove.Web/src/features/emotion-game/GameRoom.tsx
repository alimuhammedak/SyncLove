/**
 * Game Room Component
 * Main game view with canvas, guessing, and scoring
 */

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEmotionGame } from './hooks/useEmotionGame';
import DrawingCanvas, { type DrawingCanvasRef, type DrawingStroke } from './components/DrawingCanvas';
import EmotionCard from './components/EmotionCard';
import GuessingPanel from './components/GuessingPanel';
import ScoreBoard from './components/ScoreBoard';
import TimerDisplay from './components/TimerDisplay';
import { DIFFICULTY_COLORS, DIFFICULTY_LABELS, type EmotionDifficulty } from './utils/emotions';
import { ArrowLeft, Users, Copy, Check, Sparkles, Eye } from 'lucide-react';

interface GameRoomProps {
    sessionId: string;
    onLeave: () => void;
}

type GamePhase = 'waiting' | 'selecting' | 'drawing' | 'roundEnd';

export default function GameRoom({ sessionId, onLeave }: GameRoomProps) {
    const canvasRef = useRef<DrawingCanvasRef>(null);
    const [phase, setPhase] = useState<GamePhase>('waiting');
    const [copied, setCopied] = useState(false);

    const {
        players,
        currentRound,
        emotionOptions,
        isDrawer,
        emotionToDraw,
        scores,
        roundNumber,
        totalRounds,
        receivedStrokes,
        reactions,
        getEmotionOptions,
        startRound,
        sendStroke,
        submitGuess,
        sendReaction,
        endRound,
        clearCanvas,
        leaveGame,
    } = useEmotionGame();

    // Apply received strokes to canvas (for spectators)
    useEffect(() => {
        if (!isDrawer && receivedStrokes.length > 0) {
            const lastStroke = receivedStrokes[receivedStrokes.length - 1];
            canvasRef.current?.addStroke(lastStroke);
        }
    }, [receivedStrokes, isDrawer]);

    // Update phase based on game state
    useEffect(() => {
        if (currentRound?.isComplete) {
            setPhase('roundEnd');
        } else if (currentRound && !currentRound.isComplete) {
            setPhase('drawing');
        } else if (emotionOptions.length > 0 && isDrawer) {
            setPhase('selecting');
        } else {
            setPhase('waiting');
        }
    }, [currentRound, emotionOptions, isDrawer]);

    const handleCopyCode = () => {
        navigator.clipboard.writeText(sessionId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleLeave = async () => {
        await leaveGame();
        onLeave();
    };

    const handleSelectEmotion = async (emotion: string) => {
        await startRound(emotion);
        setPhase('drawing');
    };

    const handleStrokeComplete = async (stroke: DrawingStroke) => {
        await sendStroke(stroke);
    };

    const handleStartNewRound = async () => {
        canvasRef.current?.clear();
        await getEmotionOptions();
        setPhase('selecting');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 px-4 py-3">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleLeave}
                            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                        >
                            <ArrowLeft size={20} />
                        </button>

                        {/* Room code */}
                        <button
                            onClick={handleCopyCode}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white transition-colors"
                        >
                            <span className="font-mono text-lg tracking-wider">{sessionId}</span>
                            {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Players count */}
                        <div className="flex items-center gap-2 text-white/60">
                            <Users size={18} />
                            <span>{players.length}</span>
                        </div>

                        {/* Round indicator */}
                        <div className="px-3 py-1 rounded-full bg-white/10 text-white/60 text-sm">
                            Tur {roundNumber}/{totalRounds}
                        </div>

                        {/* Compact scoreboard */}
                        {scores.length > 0 && <ScoreBoard scores={scores} compact />}
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="pt-20 pb-8 px-4">
                <div className="max-w-7xl mx-auto">
                    <AnimatePresence mode="wait">
                        {/* Waiting phase */}
                        {phase === 'waiting' && (
                            <motion.div
                                key="waiting"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center min-h-[600px] text-center"
                            >
                                <Sparkles className="w-16 h-16 text-purple-400 mb-4 animate-pulse" />
                                <h2 className="text-2xl font-bold text-white mb-2">Oyun Bekleniyor</h2>
                                <p className="text-white/60 mb-6">Diğer oyuncuların katılmasını bekleyin</p>

                                {players.length >= 2 && (
                                    <motion.button
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleStartNewRound}
                                        className="px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold shadow-xl shadow-purple-500/30"
                                    >
                                        Oyunu Başlat
                                    </motion.button>
                                )}
                            </motion.div>
                        )}

                        {/* Selecting phase (drawer only) */}
                        {phase === 'selecting' && isDrawer && (
                            <motion.div
                                key="selecting"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center py-8"
                            >
                                <h2 className="text-2xl font-bold text-white mb-2">Çizmek İçin Duygu Seç</h2>
                                <p className="text-white/60 mb-8">Daha zor duygular daha çok puan kazandırır</p>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full">
                                    {emotionOptions.map((option, index) => (
                                        <EmotionCard
                                            key={option.emotion}
                                            option={option}
                                            index={index}
                                            onSelect={handleSelectEmotion}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {/* Selecting phase (waiting for drawer) */}
                        {phase === 'selecting' && !isDrawer && (
                            <motion.div
                                key="selecting-wait"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center min-h-[600px] text-center"
                            >
                                <Eye className="w-16 h-16 text-blue-400 mb-4 animate-pulse" />
                                <h2 className="text-2xl font-bold text-white mb-2">Çizici Duygu Seçiyor</h2>
                                <p className="text-white/60">Birazdan çizim başlayacak...</p>
                            </motion.div>
                        )}

                        {/* Drawing phase */}
                        {phase === 'drawing' && currentRound && (
                            <motion.div
                                key="drawing"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="grid grid-cols-1 lg:grid-cols-4 gap-6"
                            >
                                {/* Main canvas area */}
                                <div className="lg:col-span-3 space-y-4">
                                    {/* Info bar */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            {isDrawer && emotionToDraw && (
                                                <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30">
                                                    <span className="text-sm text-white/60">Çizmen gereken: </span>
                                                    <span className="text-lg font-bold text-white">{emotionToDraw}</span>
                                                </div>
                                            )}
                                            <div
                                                className="px-3 py-1 rounded-full text-sm font-medium"
                                                style={{
                                                    backgroundColor: `${DIFFICULTY_COLORS[currentRound.difficulty as EmotionDifficulty]}20`,
                                                    color: DIFFICULTY_COLORS[currentRound.difficulty as EmotionDifficulty],
                                                }}
                                            >
                                                {DIFFICULTY_LABELS[currentRound.difficulty as EmotionDifficulty]} • {currentRound.category}
                                            </div>
                                        </div>
                                        <TimerDisplay
                                            timeLimit={currentRound.timeLimit}
                                            startedAt={new Date()}
                                            onTimeUp={endRound}
                                        />
                                    </div>

                                    {/* Canvas */}
                                    <DrawingCanvas
                                        ref={canvasRef}
                                        isDrawer={isDrawer}
                                        onStrokeComplete={handleStrokeComplete}
                                        onClear={clearCanvas}
                                        className="w-full"
                                    />

                                    {/* Reactions display */}
                                    <div className="flex justify-center min-h-[40px]">
                                        <AnimatePresence>
                                            {reactions.slice(-5).map((reaction) => (
                                                <motion.span
                                                    key={`${reaction.senderId}-${reaction.timestamp}`}
                                                    initial={{ scale: 0, y: 20 }}
                                                    animate={{ scale: 1, y: 0 }}
                                                    exit={{ scale: 0, opacity: 0 }}
                                                    className="text-2xl mx-1"
                                                >
                                                    {reaction.reactionType === 'heart' && '❤️'}
                                                    {reaction.reactionType === 'broken-heart' && '💔'}
                                                    {reaction.reactionType === 'fire' && '🔥'}
                                                    {reaction.reactionType === 'storm' && '⚡'}
                                                    {reaction.reactionType === 'wave' && '🌊'}
                                                    {reaction.reactionType === 'sparkle' && '✨'}
                                                    {reaction.reactionType === 'thinking' && '🤔'}
                                                    {reaction.reactionType === 'wow' && '😮'}
                                                </motion.span>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                {/* Side panel */}
                                <div className="lg:col-span-1 space-y-4">
                                    {/* Guessing panel (for non-drawers) */}
                                    {!isDrawer && (
                                        <div className="h-[500px]">
                                            <GuessingPanel
                                                onSubmitGuess={submitGuess}
                                                onSendReaction={sendReaction}
                                                guesses={currentRound.guesses}
                                                disabled={currentRound.isComplete}
                                            />
                                        </div>
                                    )}

                                    {/* Scoreboard */}
                                    <ScoreBoard scores={scores} />
                                </div>
                            </motion.div>
                        )}

                        {/* Round end phase */}
                        {phase === 'roundEnd' && currentRound && (
                            <motion.div
                                key="roundEnd"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center min-h-[600px] text-center"
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', delay: 0.2 }}
                                    className="mb-6"
                                >
                                    {currentRound.winnerId ? (
                                        <div className="text-6xl">🎉</div>
                                    ) : (
                                        <div className="text-6xl">⏰</div>
                                    )}
                                </motion.div>

                                <h2 className="text-3xl font-bold text-white mb-2">
                                    {currentRound.winnerId ? 'Doğru Tahmin!' : 'Süre Doldu!'}
                                </h2>

                                <p className="text-xl text-white/80 mb-2">
                                    Duygu: <span className="font-bold text-pink-400">{emotionToDraw || currentRound.emotion}</span>
                                </p>

                                <div className="my-8 w-full max-w-md">
                                    <ScoreBoard scores={scores} />
                                </div>

                                {roundNumber < totalRounds ? (
                                    <motion.button
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleStartNewRound}
                                        className="px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold shadow-xl shadow-purple-500/30"
                                    >
                                        Sonraki Tur
                                    </motion.button>
                                ) : (
                                    <motion.div
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                        className="text-center"
                                    >
                                        <h3 className="text-2xl font-bold text-yellow-400 mb-4">🏆 Oyun Bitti!</h3>
                                        <button
                                            onClick={handleLeave}
                                            className="px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors"
                                        >
                                            Lobiye Dön
                                        </button>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}
