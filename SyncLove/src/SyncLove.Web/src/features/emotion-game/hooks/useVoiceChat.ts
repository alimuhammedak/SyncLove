/**
 * Voice Chat Hook using Agora.io
 * Manages real-time voice communication in the lobby
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import AgoraRTC, {
    IAgoraRTCClient,
    IMicrophoneAudioTrack,
    IAgoraRTCRemoteUser
} from 'agora-rtc-sdk-ng';
import { apiClient } from '../../../lib/api';

interface VoiceChatState {
    isConnected: boolean;
    isConnecting: boolean;
    isMuted: boolean;
    remoteUsers: string[];
    error: string | null;
}

interface UseVoiceChatReturn extends VoiceChatState {
    joinChannel: (channelName: string) => Promise<void>;
    leaveChannel: () => Promise<void>;
    toggleMute: () => void;
}

export function useVoiceChat(): UseVoiceChatReturn {
    const clientRef = useRef<IAgoraRTCClient | null>(null);
    const localTrackRef = useRef<IMicrophoneAudioTrack | null>(null);

    const [state, setState] = useState<VoiceChatState>({
        isConnected: false,
        isConnecting: false,
        isMuted: false,
        remoteUsers: [],
        error: null,
    });

    // Initialize Agora client
    useEffect(() => {
        clientRef.current = AgoraRTC.createClient({
            mode: 'rtc',
            codec: 'vp8'
        });

        const client = clientRef.current;

        // Handle remote user joining
        client.on('user-published', async (user: IAgoraRTCRemoteUser, mediaType) => {
            if (mediaType === 'audio') {
                await client.subscribe(user, mediaType);
                user.audioTrack?.play();

                setState(prev => ({
                    ...prev,
                    remoteUsers: [...prev.remoteUsers.filter(id => id !== user.uid.toString()), user.uid.toString()]
                }));
            }
        });

        // Handle remote user leaving
        client.on('user-unpublished', (user: IAgoraRTCRemoteUser) => {
            setState(prev => ({
                ...prev,
                remoteUsers: prev.remoteUsers.filter(id => id !== user.uid.toString())
            }));
        });

        client.on('user-left', (user: IAgoraRTCRemoteUser) => {
            setState(prev => ({
                ...prev,
                remoteUsers: prev.remoteUsers.filter(id => id !== user.uid.toString())
            }));
        });

        return () => {
            leaveChannel();
            client.removeAllListeners();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const joinChannel = useCallback(async (channelName: string) => {
        if (!clientRef.current) return;

        setState(prev => ({ ...prev, isConnecting: true, error: null }));

        try {
            // Get token from backend
            const response = await apiClient.get<{
                Token: string;
                AppId: string;
                ChannelName: string;
                UserId: string;
            }>(`/agora/token?channelName=${channelName}`);

            const { Token, AppId, UserId } = response;

            // Create local audio track
            localTrackRef.current = await AgoraRTC.createMicrophoneAudioTrack();

            // Join the channel
            await clientRef.current.join(AppId, channelName, Token, UserId);

            // Publish local track
            await clientRef.current.publish([localTrackRef.current]);

            setState(prev => ({
                ...prev,
                isConnected: true,
                isConnecting: false,
            }));
        } catch (error) {
            console.error('Failed to join voice channel:', error);
            setState(prev => ({
                ...prev,
                isConnecting: false,
                error: `Sesli sohbete bağlanılamadı: ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`
            }));
        }
    }, []);

    const leaveChannel = useCallback(async () => {
        if (localTrackRef.current) {
            localTrackRef.current.stop();
            localTrackRef.current.close();
            localTrackRef.current = null;
        }

        if (clientRef.current) {
            await clientRef.current.leave();
        }

        setState({
            isConnected: false,
            isConnecting: false,
            isMuted: false,
            remoteUsers: [],
            error: null,
        });
    }, []);

    const toggleMute = useCallback(() => {
        if (localTrackRef.current) {
            const newMutedState = !state.isMuted;
            localTrackRef.current.setEnabled(!newMutedState);
            setState(prev => ({ ...prev, isMuted: newMutedState }));
        }
    }, [state.isMuted]);

    return {
        ...state,
        joinChannel,
        leaveChannel,
        toggleMute,
    };
}

export default useVoiceChat;
