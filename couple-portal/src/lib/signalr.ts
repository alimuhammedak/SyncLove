import { HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import { API_ENDPOINTS } from './api-config';
import { tokenStorage } from './api';

/**
 * Drawing point for real-time sync
 */
export interface DrawingPoint {
    x: number;
    y: number;
    color: string;
    size: number;
    isNewStroke: boolean;
}

/**
 * Game state update message
 */
export interface GameStateUpdate {
    sessionId: string;
    gameState: string;
    updatedBy: string;
}

/**
 * SignalR connection manager
 */
class SignalRConnection {
    private connection: HubConnection | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;

    /**
     * Initialize the SignalR connection
     */
    async connect(): Promise<HubConnection> {
        if (this.connection?.state === HubConnectionState.Connected) {
            return this.connection;
        }

        const token = tokenStorage.getAccessToken();
        if (!token) {
            throw new Error('No access token available');
        }

        this.connection = new HubConnectionBuilder()
            .withUrl(API_ENDPOINTS.hubs.game, {
                accessTokenFactory: () => token,
            })
            .withAutomaticReconnect({
                nextRetryDelayInMilliseconds: (retryContext) => {
                    if (retryContext.previousRetryCount >= this.maxReconnectAttempts) {
                        return null; // Stop reconnecting
                    }
                    return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000);
                },
            })
            .configureLogging(LogLevel.Information)
            .build();

        // Set up reconnection handlers
        this.connection.onreconnecting((error) => {
            console.log('SignalR reconnecting...', error);
            this.reconnectAttempts++;
        });

        this.connection.onreconnected((connectionId) => {
            console.log('SignalR reconnected:', connectionId);
            this.reconnectAttempts = 0;
        });

        this.connection.onclose((error) => {
            console.log('SignalR connection closed:', error);
        });

        await this.connection.start();
        return this.connection;
    }

    /**
     * Disconnect from SignalR
     */
    async disconnect(): Promise<void> {
        if (this.connection) {
            await this.connection.stop();
            this.connection = null;
        }
    }

    /**
     * Get the current connection
     */
    getConnection(): HubConnection | null {
        return this.connection;
    }

    /**
     * Check if connected
     */
    isConnected(): boolean {
        return this.connection?.state === HubConnectionState.Connected;
    }

    // ============ Game Hub Methods ============

    /**
     * Join a game session
     */
    async joinGame(sessionId: string): Promise<void> {
        if (!this.connection) throw new Error('Not connected');
        await this.connection.invoke('JoinGame', sessionId);
    }

    /**
     * Leave a game session
     */
    async leaveGame(sessionId: string): Promise<void> {
        if (!this.connection) throw new Error('Not connected');
        await this.connection.invoke('LeaveGame', sessionId);
    }

    /**
     * Send game state to other players
     */
    async sendGameState(sessionId: string, gameState: object): Promise<void> {
        if (!this.connection) throw new Error('Not connected');
        await this.connection.invoke('SendGameState', sessionId, gameState);
    }

    /**
     * Send drawing data to partner
     */
    async sendDrawing(sessionId: string, points: DrawingPoint[]): Promise<void> {
        if (!this.connection) throw new Error('Not connected');
        await this.connection.invoke('SendDrawing', sessionId, points);
    }

    /**
     * Send cursor position
     */
    async sendCursor(sessionId: string, x: number, y: number): Promise<void> {
        if (!this.connection) throw new Error('Not connected');
        await this.connection.invoke('SendCursor', sessionId, x, y);
    }

    // ============ Event Listeners ============

    /**
     * Listen for player joined events
     */
    onPlayerJoined(callback: (data: { sessionId: string; playerId: string; joinedAt: string }) => void): void {
        this.connection?.on('PlayerJoined', callback);
    }

    /**
     * Listen for player left events
     */
    onPlayerLeft(callback: (data: { sessionId: string; playerId: string; leftAt: string }) => void): void {
        this.connection?.on('PlayerLeft', callback);
    }

    /**
     * Listen for game state updates
     */
    onGameStateReceived(callback: (update: GameStateUpdate) => void): void {
        this.connection?.on('ReceiveGameState', callback);
    }

    /**
     * Listen for drawing data
     */
    onDrawingReceived(callback: (data: { sessionId: string; senderId: string; points: DrawingPoint[]; timestamp: string }) => void): void {
        this.connection?.on('ReceiveDrawing', callback);
    }

    /**
     * Listen for cursor updates
     */
    onCursorReceived(callback: (data: { playerId: string; x: number; y: number }) => void): void {
        this.connection?.on('ReceiveCursor', callback);
    }

    /**
     * Listen for user connection events
     */
    onUserConnected(callback: (userId: string) => void): void {
        this.connection?.on('UserConnected', callback);
    }

    /**
     * Listen for user disconnection events
     */
    onUserDisconnected(callback: (userId: string) => void): void {
        this.connection?.on('UserDisconnected', callback);
    }
}

// Singleton instance
export const signalR = new SignalRConnection();
export default signalR;
