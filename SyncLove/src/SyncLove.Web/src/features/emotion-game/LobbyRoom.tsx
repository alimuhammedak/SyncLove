/**
 * Lobby Room Component
 * Shows room code, player list, voice controls, and start game button
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEmotionGame } from './hooks/useEmotionGame';
import { useVoiceChat } from './hooks/useVoiceChat';
import { showSuccess, showError, showInfo } from '../../lib/toast';
import {
    Crown,
    Copy,
    Check,
    Mic,
    MicOff,
    Users,
    Loader2,
    ArrowLeft,
    Volume2,
    VolumeX,
    Sparkles
} from 'lucide-react';

interface LobbyRoomProps {
    sessionId: string;
    onGameStart: () => void;
    onLeave: () => void;
}

export default function LobbyRoom({ sessionId, onGameStart, onLeave }: LobbyRoomProps) {
    const [copied, setCopied] = useState(false);

    const {
        players,
        hostId,
        isHost,
        isGameStarted,
        startGame,
        leaveGame,
    } = useEmotionGame();

    const {
        isConnected: isVoiceConnected,
        isConnecting: isVoiceConnecting,
        isMuted,
        remoteUsers,
        error: voiceError,
        joinChannel,
        leaveChannel,
        toggleMute,
    } = useVoiceChat();

    // Join voice chat when entering lobby
    useEffect(() => {
        joinChannel(sessionId);
        return () => {
            leaveChannel();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sessionId]);

    // Handle game start from host
    useEffect(() => {
        if (isGameStarted) {
            onGameStart();
        }
    }, [isGameStarted, onGameStart]);

    const handleCopyCode = () => {
        navigator.clipboard.writeText(sessionId);
        setCopied(true);
        showSuccess('Oda kodu kopyalandı!');
        setTimeout(() => setCopied(false), 2000);
    };

    const handleLeave = async () => {
        await leaveChannel();
        await leaveGame();
        onLeave();
    };

    const handleStartGame = async () => {
        try {
            await startGame();
            showInfo('Oyun başlıyor!');
        } catch {
            showError('Oyun başlatılamadı');
        }
    };

    const canStartGame = isHost && (players?.length || 0) >= 2;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={handleLeave}
                        className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="text-2xl font-bold text-white">Oyun Lobisi</h1>
                    <div className="w-10" /> {/* Spacer */}
                </div>

                {/* Room Code */}
                <motion.button
                    onClick={handleCopyCode}
                    className="w-full mb-6 p-4 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center gap-3 hover:bg-purple-500/30 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <span className="text-white/60 text-sm">Oda Kodu:</span>
                    <span className="text-2xl font-mono font-bold text-white tracking-widest">{sessionId}</span>
                    {copied ? (
                        <Check size={20} className="text-green-400" />
                    ) : (
                        <Copy size={20} className="text-white/60" />
                    )}
                </motion.button>

                {/* Player List */}
                <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Users size={18} />
                            Oyuncular
                        </h2>
                        <span className="text-sm text-white/60">{players.length}/2</span>
                    </div>

                    <div className="space-y-3">
                        <AnimatePresence>
                            {(players || []).map((player, index) => (
                                <motion.div
                                    key={player.playerId}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center justify-between p-3 rounded-xl bg-white/5"
                                >
                                    <div className="flex items-center gap-3">
                                        {/* Avatar */}
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                            {player.displayName?.charAt(0).toUpperCase() || '?'}
                                        </div>
                                        {/* Name & Host badge */}
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-white font-medium">{player.displayName}</span>
                                                {player.isHost && (
                                                    <Crown size={14} className="text-yellow-400" />
                                                )}
                                            </div>
                                            {player.isHost && (
                                                <span className="text-xs text-yellow-400/70">Oda Sahibi</span>
                                            )}
                                        </div>
                                    </div>
                                    {/* Voice indicator */}
                                    <div className="flex items-center gap-2">
                                        {remoteUsers.includes(player.playerId) || player.playerId === hostId ? (
                                            <Volume2 size={16} className="text-green-400" />
                                        ) : (
                                            <VolumeX size={16} className="text-white/30" />
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Waiting for players */}
                        {players.length < 2 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-white/20 text-white/40"
                            >
                                <Loader2 size={16} className="animate-spin" />
                                <span>Diğer oyuncu bekleniyor...</span>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Voice Chat Controls */}
                <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/10">
                    <h3 className="text-sm font-medium text-white/60 mb-3">Sesli Sohbet</h3>

                    {voiceError && (
                        <p className="text-sm text-red-400 mb-3">{voiceError}</p>
                    )}

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {isVoiceConnecting ? (
                                <Loader2 size={16} className="animate-spin text-white/60" />
                            ) : isVoiceConnected ? (
                                <div className="w-2 h-2 rounded-full bg-green-400" />
                            ) : (
                                <div className="w-2 h-2 rounded-full bg-red-400" />
                            )}
                            <span className="text-sm text-white/60">
                                {isVoiceConnecting ? 'Bağlanıyor...' : isVoiceConnected ? 'Bağlandı' : 'Bağlı değil'}
                            </span>
                        </div>

                        <motion.button
                            onClick={toggleMute}
                            disabled={!isVoiceConnected}
                            className={`p-3 rounded-xl transition-colors ${isMuted
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : 'bg-green-500/20 text-green-400 border border-green-500/30'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                        </motion.button>
                    </div>
                </div>

                {/* Start Game Button (Host only) */}
                {isHost && (
                    <motion.button
                        onClick={handleStartGame}
                        disabled={!canStartGame}
                        className="w-full p-4 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold flex items-center justify-center gap-3 shadow-xl shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                        whileHover={canStartGame ? { scale: 1.02 } : {}}
                        whileTap={canStartGame ? { scale: 0.98 } : {}}
                    >
                        <Sparkles size={20} />
                        Oyunu Başlat
                    </motion.button>
                )}

                {/* Waiting message for non-host */}
                {!isHost && (
                    <div className="text-center p-4 rounded-2xl bg-white/5 border border-white/10">
                        <p className="text-white/60">Oda sahibinin oyunu başlatmasını bekliyorsunuz...</p>
                    </div>
                )}

                {/* Ready status */}
                {players.length >= 2 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 text-center"
                    >
                        <span className="text-green-400 text-sm">✓ Oyun başlamaya hazır!</span>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
}
