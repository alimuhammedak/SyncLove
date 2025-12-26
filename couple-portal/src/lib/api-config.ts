/**
 * API Configuration and Base URL
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5166';

export const API_ENDPOINTS = {
    auth: {
        register: `${API_BASE_URL}/api/auth/register`,
        login: `${API_BASE_URL}/api/auth/login`,
        refresh: `${API_BASE_URL}/api/auth/refresh`,
        revoke: `${API_BASE_URL}/api/auth/revoke`,
    },
    users: {
        me: `${API_BASE_URL}/api/users/me`,
    },
    games: {
        base: `${API_BASE_URL}/api/games`,
        byId: (id: string) => `${API_BASE_URL}/api/games/${id}`,
        join: (id: string) => `${API_BASE_URL}/api/games/${id}/join`,
        complete: (id: string) => `${API_BASE_URL}/api/games/${id}/complete`,
        mySessions: `${API_BASE_URL}/api/games/my-sessions`,
    },
    hubs: {
        game: `${API_BASE_URL}/hubs/game`,
    },
} as const;

export { API_BASE_URL };
