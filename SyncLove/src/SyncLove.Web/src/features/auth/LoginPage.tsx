import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Mail, Lock, User, Loader2 } from 'lucide-react'
import { useAuth } from '../auth'
import { showSuccess, showError } from '../../lib/toast'

type AuthMode = 'login' | 'register'

/**
 * Login/Register page for authentication.
 */
export function LoginPage() {
    const { signIn, signUp, isLoading } = useAuth()
    const [mode, setMode] = useState<AuthMode>('login')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [displayName, setDisplayName] = useState('')
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        try {
            if (mode === 'login') {
                await signIn(email, password)
                showSuccess('Giriş başarılı! Hoş geldiniz 💕')
            } else {
                if (!displayName.trim()) {
                    showError('Görünen ad gereklidir')
                    return
                }
                await signUp(email, password, displayName)
                showSuccess('Hesabınız oluşturuldu! Hoş geldiniz 💕')
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Kimlik doğrulama başarısız'
            setError(errorMessage)
            showError(errorMessage)
        }
    }

    const toggleMode = () => {
        setMode(mode === 'login' ? 'register' : 'login')
        setError(null)
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-[var(--color-background)] px-4">
            <motion.div
                className="w-full max-w-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                {/* Header */}
                <div className="mb-8 text-center">
                    <motion.div
                        className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-pink-500/20"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <Heart className="h-8 w-8 text-pink-500" fill="currentColor" />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-[var(--color-text)]">SyncLove</h1>
                    <p className="mt-2 text-[var(--color-text-muted)]">
                        {mode === 'login' ? 'Welcome back! 💕' : 'Create your account 💕'}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {mode === 'register' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                        >
                            <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
                                Display Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-text-muted)]" />
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="Your name"
                                    className="w-full rounded-xl bg-[var(--color-surface)] py-3 pl-10 pr-4 text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-pink-500"
                                />
                            </div>
                        </motion.div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
                            Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-text-muted)]" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                required
                                className="w-full rounded-xl bg-[var(--color-surface)] py-3 pl-10 pr-4 text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-pink-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--color-text-muted)]" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                minLength={8}
                                className="w-full rounded-xl bg-[var(--color-surface)] py-3 pl-10 pr-4 text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]/50 focus:outline-none focus:ring-2 focus:ring-pink-500"
                            />
                        </div>
                    </div>

                    {error && (
                        <motion.p
                            className="text-sm text-red-500 text-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            {error}
                        </motion.p>
                    )}

                    <motion.button
                        type="submit"
                        disabled={isLoading}
                        className="w-full rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 py-3 font-semibold text-white shadow-lg shadow-pink-500/25 transition-all hover:shadow-xl hover:shadow-pink-500/30 disabled:opacity-50"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {isLoading ? (
                            <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                        ) : (
                            mode === 'login' ? 'Sign In' : 'Create Account'
                        )}
                    </motion.button>
                </form>

                {/* Toggle Mode */}
                <p className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
                    {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                    <button
                        type="button"
                        onClick={toggleMode}
                        className="font-medium text-pink-500 hover:text-pink-400"
                    >
                        {mode === 'login' ? 'Sign Up' : 'Sign In'}
                    </button>
                </p>
            </motion.div>
        </div>
    )
}

export default LoginPage
