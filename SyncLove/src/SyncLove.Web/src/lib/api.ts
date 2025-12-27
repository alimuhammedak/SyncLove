import { API_ENDPOINTS } from './api-config';

/**
 * Auth token storage keys
 */
const TOKEN_KEY = 'synclove_access_token';
const REFRESH_TOKEN_KEY = 'synclove_refresh_token';
const TOKEN_EXPIRY_KEY = 'synclove_token_expiry';

/**
 * Auth response from the API
 */
export interface AuthResponse {
    userId: string;
    email: string;
    displayName: string;
    avatarUrl: string | null;
    accessToken: string;
    refreshToken: string;
    accessTokenExpires: string;
}

/**
 * User DTO
 */
export interface User {
    id: string;
    email: string;
    displayName: string;
    avatarUrl: string | null;
    partnerId: string | null;
    isOnline: boolean;
    lastOnlineAt: string | null;
}

/**
 * API Error response
 */
interface ApiError {
    error: string;
    code: string;
}

/**
 * Token management utilities
 */
export const tokenStorage = {
    getAccessToken: (): string | null => localStorage.getItem(TOKEN_KEY),

    getRefreshToken: (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY),

    getTokenExpiry: (): Date | null => {
        const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
        return expiry ? new Date(expiry) : null;
    },

    setTokens: (auth: AuthResponse): void => {
        localStorage.setItem(TOKEN_KEY, auth.accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, auth.refreshToken);
        localStorage.setItem(TOKEN_EXPIRY_KEY, auth.accessTokenExpires);
    },

    clearTokens: (): void => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(TOKEN_EXPIRY_KEY);
    },

    isTokenExpired: (): boolean => {
        const expiry = tokenStorage.getTokenExpiry();
        if (!expiry) return true;
        // Add 30 second buffer
        return new Date() >= new Date(expiry.getTime() - 30000);
    },
};

/**
 * Fetch wrapper with automatic token refresh
 */
async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    // Check if token needs refresh
    if (tokenStorage.isTokenExpired() && tokenStorage.getRefreshToken()) {
        await refreshAccessToken();
    }

    const token = tokenStorage.getAccessToken();
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    return fetch(url, { ...options, headers });
}

/**
 * Refresh the access token using refresh token
 */
async function refreshAccessToken(): Promise<boolean> {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) return false;

    try {
        const response = await fetch(API_ENDPOINTS.auth.refresh, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
        });

        if (!response.ok) {
            tokenStorage.clearTokens();
            return false;
        }

        const data: AuthResponse = await response.json();
        tokenStorage.setTokens(data);
        return true;
    } catch {
        tokenStorage.clearTokens();
        return false;
    }
}

/**
 * API client for SyncLove backend
 */
export const api = {
    /**
     * Register a new user
     */
    async register(email: string, password: string, displayName: string): Promise<AuthResponse> {
        const response = await fetch(API_ENDPOINTS.auth.register, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, displayName }),
        });

        if (!response.ok) {
            const error: ApiError = await response.json();
            throw new Error(error.error || 'Registration failed');
        }

        const data: AuthResponse = await response.json();
        tokenStorage.setTokens(data);
        return data;
    },

    /**
     * Login with email and password
     */
    async login(email: string, password: string): Promise<AuthResponse> {
        const response = await fetch(API_ENDPOINTS.auth.login, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const error: ApiError = await response.json();
            throw new Error(error.error || 'Login failed');
        }

        const data: AuthResponse = await response.json();
        tokenStorage.setTokens(data);
        return data;
    },

    /**
     * Logout and revoke refresh token
     */
    async logout(): Promise<void> {
        const refreshToken = tokenStorage.getRefreshToken();
        if (refreshToken) {
            try {
                await fetch(API_ENDPOINTS.auth.revoke, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refreshToken }),
                });
            } catch {
                // Ignore revoke errors
            }
        }
        tokenStorage.clearTokens();
    },

    /**
     * Get current user profile
     */
    async getCurrentUser(): Promise<User> {
        const response = await fetchWithAuth(API_ENDPOINTS.users.me);

        if (!response.ok) {
            throw new Error('Failed to get user profile');
        }

        return response.json();
    },

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return !!tokenStorage.getAccessToken() && !tokenStorage.isTokenExpired();
    },
};

export default api;
