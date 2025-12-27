import { useContext } from 'react'
import { AuthContext } from './AuthContext'
import type { AuthContextType } from './types'

/**
 * Hook to access authentication state and methods.
 */
export function useAuth(): AuthContextType {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
