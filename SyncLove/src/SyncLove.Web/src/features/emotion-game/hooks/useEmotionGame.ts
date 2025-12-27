/**
 * Zustand store for Emotion Game state management.
 * Handles game flow, SignalR connection, and player state.
 */

import { create } from 'zustand';
import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { API_ENDPOINTS } from '../../../lib/api-config';
import { tokenStorage } from '../../../lib/api';
import type { EmotionOption, EmotionDifficulty } from '../utils/emotions';
import type { DrawingStroke } from '../components/DrawingCanvas';

// Types
export interface GuessResult {
    playerId: string;
    guessText: string;
    isExactMatch: boolean;
    resonanceScore: number;
    guessedAt: string;
}

export interface PlayerScore {
    playerId: string;
    displayName: string;
    totalScore: number;
    correctGuesses: number;
    resonancePoints: number;
}

export interface PlayerInfo {
    playerId: string;
    displayName: string;
    isHost: boolean;
    isReady: boolean;
}

export interface RoundState {
    roundId: string;
    emotion: string | null; // null for guessing players
    category: string;
    difficulty: EmotionDifficulty;
    drawerId: string;
    timeLimit: number;
    timeRemaining: number;
    guesses: GuessResult[];
    isComplete: boolean;
    winnerId: string | null;
}

export interface Reaction {
    senderId: string;
    reactionType: string;
    timestamp: string;
}

export interface EmotionGameState {
    // Connection
    connection: HubConnection | null;
    isConnected: boolean;
    isConnecting: boolean;
    connectionError: string | null;

    // Session
    sessionId: string | null;
    players: PlayerInfo[];
    hostId: string | null;
    isHost: boolean;
    isGameStarted: boolean;

    // Current round
    currentRound: RoundState | null;
    emotionOptions: EmotionOption[];
    isDrawer: boolean;
    emotionToDraw: string | null;

    // Scoring
    scores: PlayerScore[];
    roundNumber: number;
    totalRounds: number;

    // Drawing
    receivedStrokes: DrawingStroke[];

    // Reactions
    reactions: Reaction[];

    // Actions
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    joinGame: (sessionId: string) => Promise<void>;
    leaveGame: () => Promise<void>;
    startGame: () => Promise<void>;
    getEmotionOptions: () => Promise<void>;
    startRound: (emotion: string) => Promise<void>;
    sendStroke: (stroke: DrawingStroke) => Promise<void>;
    submitGuess: (guessText: string) => Promise<void>;
    sendReaction: (reactionType: string) => Promise<void>;
    endRound: () => Promise<void>;
    clearCanvas: () => Promise<void>;
    reset: () => void;
}

const initialState = {
    connection: null,
    isConnected: false,
    isConnecting: false,
    connectionError: null,
    sessionId: null,
    players: [] as PlayerInfo[],
    hostId: null,
    isHost: false,
    isGameStarted: false,
    currentRound: null,
    emotionOptions: [],
    isDrawer: false,
    emotionToDraw: null,
    scores: [],
    roundNumber: 0,
    totalRounds: 5,
    receivedStrokes: [],
    reactions: [],
};

export const useEmotionGame = create<EmotionGameState>((set, get) => ({
    ...initialState,

    connect: async () => {
        const { connection, isConnected, isConnecting } = get();

        if (isConnected || isConnecting || connection?.state === HubConnectionState.Connected) {
            return;
        }

        set({ isConnecting: true, connectionError: null });

        const token = tokenStorage.getAccessToken();
        if (!token) {
            set({ isConnecting: false, connectionError: 'Oturum açmanız gerekiyor' });
            return;
        }

        try {
            const newConnection = new HubConnectionBuilder()
                .withUrl(API_ENDPOINTS.hubs.emotionGame, {
                    accessTokenFactory: () => token,
                })
                .withAutomaticReconnect()
                .configureLogging(LogLevel.Information)
                .build();

            // Set up event listeners
            newConnection.on('PlayerJoinedEmotion', (data) => {
                set(state => {
                    const players = state.players || [];
                    const existingPlayer = players.find(p => p.playerId === data.playerId);
                    if (existingPlayer) return state;

                    return {
                        players: [...players, {
                            playerId: data.playerId,
                            displayName: data.displayName,
                            isHost: data.isHost,
                            isReady: false
                        }],
                    };
                });
            });

            newConnection.on('PlayerLeftEmotion', (data) => {
                set(state => ({
                    players: (state.players || []).filter(p => p.playerId !== data.playerId),
                    hostId: data.newHostId || state.hostId,
                    isHost: data.newHostId === (tokenStorage.getUserId() || '')
                }));
            });

            newConnection.on('EmotionOptions', (options: EmotionOption[]) => {
                set({ emotionOptions: options });
            });

            newConnection.on('GameStarted', () => {
                set({ isGameStarted: true });
            });

            newConnection.on('RoundStarted', (data) => {
                set({
                    currentRound: {
                        roundId: data.roundId,
                        emotion: null,
                        category: data.category,
                        difficulty: data.difficulty,
                        drawerId: data.drawerId,
                        timeLimit: data.timeLimit,
                        timeRemaining: data.timeLimit,
                        guesses: [],
                        isComplete: false,
                        winnerId: null,
                    },
                    isDrawer: false,
                    emotionToDraw: null,
                    receivedStrokes: [],
                    reactions: [],
                });
            });

            newConnection.on('YourEmotionToDraw', (emotion: string) => {
                set((state) => ({
                    isDrawer: true,
                    emotionToDraw: emotion,
                    currentRound: state.currentRound ? { ...state.currentRound, emotion } : null,
                }));
            });

            newConnection.on('ReceiveDrawingStroke', (data) => {
                set(state => ({
                    receivedStrokes: [...state.receivedStrokes, data.stroke],
                }));
            });

            newConnection.on('GuessResult', (result: GuessResult) => {
                set(state => ({
                    currentRound: state.currentRound ? {
                        ...state.currentRound,
                        guesses: [...state.currentRound.guesses, result],
                    } : null,
                }));
            });

            newConnection.on('ReactionReceived', (reaction: Reaction) => {
                set(state => ({
                    reactions: [...state.reactions.slice(-20), reaction], // Keep last 20
                }));
            });

            newConnection.on('RoundEnded', (data) => {
                set(state => ({
                    currentRound: state.currentRound ? {
                        ...state.currentRound,
                        isComplete: true,
                        winnerId: data.winnerId,
                    } : null,
                    scores: data.scores || [],
                    emotionToDraw: null,
                }));
            });

            newConnection.on('CanvasCleared', () => {
                set({ receivedStrokes: [] });
            });

            newConnection.on('EmotionGameState', (data) => {
                const userId = tokenStorage.getUserId() || '';
                set({
                    players: data.players || [],
                    hostId: data.hostId,
                    isHost: data.hostId === userId,
                    scores: data.scores || [],
                    roundNumber: data.roundNumber || 0,
                    totalRounds: data.totalRounds || 0,
                    currentRound: data.currentRound,
                    isGameStarted: data.isGameStarted || false,
                });
            });

            await newConnection.start();
            set({ connection: newConnection, isConnected: true, isConnecting: false });
        } catch (error) {
            set({
                isConnecting: false,
                connectionError: `Bağlantı hatası: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`,
            });
        }
    },

    disconnect: async () => {
        const { connection } = get();
        if (connection) {
            await connection.stop();
        }
        set({ ...initialState });
    },

    joinGame: async (sessionId: string) => {
        const { connection } = get();
        if (!connection) throw new Error('Bağlantı yok');

        await connection.invoke('JoinEmotionGame', sessionId);
        set({ sessionId });
    },

    leaveGame: async () => {
        const { connection, sessionId } = get();
        if (!connection || !sessionId) return;

        await connection.invoke('LeaveEmotionGame', sessionId);
        set({ sessionId: null, players: [], currentRound: null, isGameStarted: false });
    },

    startGame: async () => {
        const { connection, sessionId, isHost } = get();
        if (!connection || !sessionId || !isHost) return;

        await connection.invoke('StartGame', sessionId);
    },

    getEmotionOptions: async () => {
        const { connection, sessionId } = get();
        if (!connection || !sessionId) return;

        await connection.invoke('GetEmotionOptions', sessionId);
    },

    startRound: async (emotion: string) => {
        const { connection, sessionId } = get();
        if (!connection || !sessionId) return;

        await connection.invoke('StartRound', sessionId, emotion);
    },

    sendStroke: async (stroke: DrawingStroke) => {
        const { connection, sessionId } = get();
        if (!connection || !sessionId) return;

        await connection.invoke('SendDrawingStroke', sessionId, stroke);
    },

    submitGuess: async (guessText: string) => {
        const { connection, sessionId } = get();
        if (!connection || !sessionId) return;

        await connection.invoke('SubmitGuess', sessionId, guessText);
    },

    sendReaction: async (reactionType: string) => {
        const { connection, sessionId } = get();
        if (!connection || !sessionId) return;

        await connection.invoke('SendReaction', sessionId, reactionType);
    },

    endRound: async () => {
        const { connection, sessionId, currentRound } = get();
        if (!connection || !sessionId) return;

        await connection.invoke('EndRound', sessionId, currentRound?.winnerId !== null);
    },

    clearCanvas: async () => {
        const { connection, sessionId } = get();
        if (!connection || !sessionId) return;

        await connection.invoke('ClearCanvas', sessionId);
    },

    reset: () => {
        set({ ...initialState });
    },
}));

export default useEmotionGame;
