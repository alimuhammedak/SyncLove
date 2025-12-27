/**
 * Emotion Game Entry Point
 * Manages the flow: Menu -> Lobby -> Game
 */

import { useState } from 'react';
import GameLobby from './GameLobby';
import LobbyRoom from './LobbyRoom';
import GameRoom from './GameRoom';

type GamePhase = 'menu' | 'lobby' | 'game';

export default function EmotionGame() {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [phase, setPhase] = useState<GamePhase>('menu');

    const handleJoinGame = (id: string) => {
        setSessionId(id);
        setPhase('lobby');
    };

    const handleGameStart = () => {
        setPhase('game');
    };

    const handleLeaveGame = () => {
        setSessionId(null);
        setPhase('menu');
    };

    // Lobby phase - show players and wait for host to start
    if (phase === 'lobby' && sessionId) {
        return (
            <LobbyRoom
                sessionId={sessionId}
                onGameStart={handleGameStart}
                onLeave={handleLeaveGame}
            />
        );
    }

    // Game phase - actual gameplay
    if (phase === 'game' && sessionId) {
        return <GameRoom sessionId={sessionId} onLeave={handleLeaveGame} />;
    }

    // Menu phase - create or join room
    return <GameLobby onJoinGame={handleJoinGame} />;
}
