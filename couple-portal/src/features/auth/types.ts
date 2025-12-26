/**
 * User type for the app (matches API response)
 */
export interface User {
    id: string
    email: string
    displayName: string
    avatarUrl: string | null
    partnerId: string | null
    isOnline: boolean
    lastOnlineAt: string | null
}

export interface AuthContextType {
    user: User | null
    isLoading: boolean
    isAuthenticated: boolean
    signIn: (email: string, password: string) => Promise<void>
    signUp: (email: string, password: string, displayName: string) => Promise<void>
    signOut: () => Promise<void>
}
