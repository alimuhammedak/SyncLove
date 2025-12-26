import { useEffect, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { api, tokenStorage } from '../../lib/api'
import { AuthContext } from './AuthContext'
import type { User } from './types'

interface AuthProviderProps {
    children: ReactNode
}

/**
 * Provides authentication state and methods to the app.
 * Uses JWT tokens with the SyncLove API.
 */
export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Check authentication on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                // If we have a token, try to get user profile
                if (tokenStorage.getAccessToken()) {
                    const userData = await api.getCurrentUser()
                    setUser(userData)
                }
            } catch {
                // Token invalid or expired, clear it
                tokenStorage.clearTokens()
                setUser(null)
            } finally {
                setIsLoading(false)
            }
        }

        checkAuth()
    }, [])

    const signIn = useCallback(async (email: string, password: string): Promise<void> => {
        setIsLoading(true)
        try {
            const authResponse = await api.login(email, password)
            // Fetch full user profile
            const userData = await api.getCurrentUser()
            setUser({
                ...userData,
                displayName: authResponse.displayName,
            })
        } finally {
            setIsLoading(false)
        }
    }, [])

    const signUp = useCallback(async (email: string, password: string, displayName: string): Promise<void> => {
        setIsLoading(true)
        try {
            const authResponse = await api.register(email, password, displayName)
            // Set user from registration response
            setUser({
                id: authResponse.userId,
                email: authResponse.email,
                displayName: authResponse.displayName,
                avatarUrl: authResponse.avatarUrl,
                partnerId: null,
                isOnline: true,
                lastOnlineAt: null,
            })
        } finally {
            setIsLoading(false)
        }
    }, [])

    const signOut = useCallback(async (): Promise<void> => {
        setIsLoading(true)
        try {
            await api.logout()
            setUser(null)
        } finally {
            setIsLoading(false)
        }
    }, [])

    return (
        <AuthContext.Provider value={{
            user,
            isLoading,
            isAuthenticated: !!user,
            signIn,
            signUp,
            signOut
        }}>
            {children}
        </AuthContext.Provider>
    )
}
