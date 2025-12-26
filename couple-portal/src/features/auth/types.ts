import type { User } from 'firebase/auth'

export interface AuthContextType {
    user: User | null
    isLoading: boolean
    isAllowed: boolean
    signIn: (email: string, password: string) => Promise<void>
    signOut: () => Promise<void>
}
