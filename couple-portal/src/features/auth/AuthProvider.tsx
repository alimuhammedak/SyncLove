'use client'

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { auth } from '../../lib/firebase'
import { AuthContext } from './AuthContext'

// Allowed email addresses (only you two!)
const ALLOWED_EMAILS: string[] = [
    // TODO: Add your partner's email addresses here
    // 'partner1@email.com',
    // 'partner2@email.com',
]

interface AuthProviderProps {
    children: ReactNode
}

/**
 * Provides authentication state and methods to the app.
 */
export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Check if user email is in allowed list
    const isAllowed = user?.email
        ? ALLOWED_EMAILS.length === 0 || ALLOWED_EMAILS.includes(user.email)
        : false

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser)
            setIsLoading(false)
        })

        return () => unsubscribe()
    }, [])

    const signIn = async (email: string, password: string): Promise<void> => {
        await signInWithEmailAndPassword(auth, email, password)
    }

    const signOut = async (): Promise<void> => {
        await firebaseSignOut(auth)
    }

    return (
        <AuthContext.Provider value={{ user, isLoading, isAllowed, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}
