/**
 * Game Lobby Component
 * Room creation and joining for emotion game
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useEmotionGame } from './hooks/useEmotionGame';
import { Palette, Users, Plus, LogIn, Loader2, AlertCircle } from 'lucide-react';

interface GameLobbyProps {
    onJoinGame: (sessionId: string) => void;
}

export default function GameLobby({ onJoinGame }: GameLobbyProps) {
    const [roomCode, setRoomCode] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const { connect, joinGame, isConnecting, connectionError } = useEmotionGame();

    const generateRoomCode = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars[Math.floor(Math.random() * chars.length)];
        }
        return code;
    };

    const handleCreateRoom = async () => {
        setIsCreating(true);
        try {
            await connect();
            const newRoomCode = generateRoomCode();
            await joinGame(newRoomCode);
            onJoinGame(newRoomCode);
        } catch (error) {
            console.error('Failed to create room:', error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleJoinRoom = async () => {
        if (!roomCode.trim()) return;
        setIsJoining(true);
        try {
            await connect();
            await joinGame(roomCode.toUpperCase());
            onJoinGame(roomCode.toUpperCase());
        } catch (error) {
            console.error('Failed to join room:', error);
        } finally {
            setIsJoining(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.2 }}
                        className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-purple-500/30"
                    >
                        <Palette className="w-10 h-10 text-white" />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-white mb-2">Duygu İzleri</h1>
                    <p className="text-white/60">Duyguları çiz, tahmin et, bağlan</p>
                </div>

                {/* Error message */}
                {connectionError && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center gap-3"
                    >
                        <AlertCircle className="text-red-400 flex-shrink-0" size={20} />
                        <p className="text-sm text-red-300">{connectionError}</p>
                    </motion.div>
                )}

                {/* Create room */}
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCreateRoom}
                    disabled={isCreating || isConnecting}
                    className="w-full mb-4 p-4 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold flex items-center justify-center gap-3 shadow-xl shadow-purple-500/20 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
                >
                    {isCreating || isConnecting ? (
                        <Loader2 className="animate-spin" size={20} />
                    ) : (
                        <Plus size={20} />
                    )}
                    Yeni Oda Oluştur
                </motion.button>

                {/* Divider */}
                <div className="flex items-center gap-4 my-6">
                    <div className="flex-1 h-px bg-white/10" />
                    <span className="text-white/40 text-sm">veya</span>
                    <div className="flex-1 h-px bg-white/10" />
                </div>

                {/* Join room */}
                <div className="space-y-3">
                    <input
                        type="text"
                        value={roomCode}
                        onChange={e => setRoomCode(e.target.value.toUpperCase())}
                        placeholder="Oda kodunu girin..."
                        maxLength={6}
                        className="w-full px-4 py-4 rounded-xl bg-white/10 border border-white/20 text-white text-center text-2xl font-mono tracking-widest placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all uppercase"
                    />
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleJoinRoom}
                        disabled={!roomCode.trim() || isJoining || isConnecting}
                        className="w-full p-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                        {isJoining ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <LogIn size={20} />
                        )}
                        Odaya Katıl
                    </motion.button>
                </div>

                {/* Info */}
                <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3 text-white/60">
                        <Users size={18} />
                        <span className="text-sm">2-8 oyuncu ile oynayabilirsiniz</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
