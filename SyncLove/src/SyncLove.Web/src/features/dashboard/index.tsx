/**
 * Dashboard feature - the main portal UI.
 * Shows navigation to games, memory book, and couple status.
 */
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Gamepad2, BookHeart, Heart, Settings } from 'lucide-react'

interface MenuItemProps {
    icon: React.ReactNode
    label: string
    description: string
    color: string
    onClick?: () => void
}

/**
 * Menu item card with animation.
 */
function MenuItem({ icon, label, description, color, onClick }: MenuItemProps) {
    return (
        <motion.button
            onClick={onClick}
            className="flex w-full items-center gap-4 rounded-2xl bg-[var(--color-surface)] p-5 text-left transition-colors hover:bg-[var(--color-surface)]/80"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
        >
            <div
                className="flex h-14 w-14 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${color}20` }}
            >
                <div style={{ color }}>{icon}</div>
            </div>
            <div>
                <h3 className="text-lg font-semibold text-[var(--color-text)]">{label}</h3>
                <p className="text-sm text-[var(--color-text-muted)]">{description}</p>
            </div>
        </motion.button>
    )
}

/**
 * Main Dashboard component.
 */
export default function Dashboard() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-[var(--color-background)] px-4 py-8">
            {/* Header */}
            <motion.header
                className="mb-8 text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="mb-2 flex items-center justify-center gap-2">
                    <Heart className="h-8 w-8 text-pink-500" fill="currentColor" />
                </div>
                <h1 className="text-3xl font-bold text-[var(--color-text)]">Couple Portal</h1>
                <p className="mt-1 text-[var(--color-text-muted)]">Your digital home together 💕</p>
            </motion.header>

            {/* Menu Grid */}
            <motion.div
                className="mx-auto max-w-md space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <MenuItem
                    icon={<Gamepad2 className="h-7 w-7" />}
                    label="Games"
                    description="Play together, compete, and have fun!"
                    color="#6366f1"
                    onClick={() => navigate('/games')}
                />

                <MenuItem
                    icon={<BookHeart className="h-7 w-7" />}
                    label="Memory Book"
                    description="Your shared history and achievements"
                    color="#f472b6"
                    onClick={() => navigate('/memory-book')}
                />

                <MenuItem
                    icon={<Settings className="h-7 w-7" />}
                    label="Settings"
                    description="Customize your portal"
                    color="#94a3b8"
                    onClick={() => navigate('/settings')}
                />
            </motion.div>

            {/* Footer */}
            <motion.footer
                className="mt-12 text-center text-sm text-[var(--color-text-muted)]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
            >
                <p>Made with 💖 for us</p>
            </motion.footer>
        </div>
    )
}
