/**
 * Voice Chat Hook using Agora.io
 * Manages real-time voice communication in the lobby
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import type {
    IAgoraRTCClient,
    IMicrophoneAudioTrack,
    IAgoraRTCRemoteUser
} from 'agora-rtc-sdk-ng';
import { API_ENDPOINTS } from '../../../lib/api-config';
import { tokenStorage } from '../../../lib/api';

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
        if (!clientRef.current || state.isConnected || state.isConnecting) return;

        setState(prev => ({ ...prev, isConnecting: true, error: null }));

        try {
            const authToken = tokenStorage.getAccessToken();
            if (!authToken) throw new Error('Oturum açılmamış');

            // Fetch token from backend
            const response = await fetch(`${API_ENDPOINTS.agora.token}?channelName=${channelName}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Token alınamadı');
            }

            const { token, appId, uid } = await response.json();

            console.log('DEBUG: Joining Agora with:', {
                appId,
                channelName,
                uid
            });

            // ALERT: Check this AppID in console
            console.error('CRITICAL DEBUG - AGORA APPID:', appId);
            console.error('CRITICAL DEBUG - AGORA TOKEN:', token);

            // Create local audio track if not already exists
            if (!localTrackRef.current) {
                localTrackRef.current = await AgoraRTC.createMicrophoneAudioTrack();
            }

            // Join the channel with numeric UID from backend
            await clientRef.current.join(appId, channelName, token, uid);

            // Publish local track
            await clientRef.current.publish([localTrackRef.current]);

            setState(prev => ({
                ...prev,
                isConnected: true,
                isConnecting: false,
            }));
            console.log('DEBUG: Agora Join Success');
        } catch (error: any) {
            console.error('Failed to join voice channel:', error);
            setState(prev => ({
                ...prev,
                isConnecting: false,
                error: `Bağlantı hatası: ${error.message || 'Bilinmeyen hata'}`
            }));
        }
    }, [state.isConnected, state.isConnecting]);

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
