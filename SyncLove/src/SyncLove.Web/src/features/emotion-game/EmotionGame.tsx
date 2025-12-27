import { useState } from 'react';
import GameLobby from './GameLobby';
import GameRoom from './GameRoom';

export default function EmotionGame() {
    const [sessionId, setSessionId] = useState<string | null>(null);

    const handleJoinGame = (id: string) => {
        setSessionId(id);
    };

    const handleLeaveGame = () => {
        setSessionId(null);
    };

    if (sessionId) {
        return <GameRoom sessionId={sessionId} onLeave={handleLeaveGame} />;
    }

    return <GameLobby onJoinGame={handleJoinGame} />;
}
