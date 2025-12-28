/**
 * Profile Page Component
 * Shows user information and provides logout functionality.
 */
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Mail, LogOut, ArrowLeft, Heart } from 'lucide-react';
import { useAuth } from '../auth';
import { showSuccess } from '../../lib/toast';

export default function ProfilePage() {
    const navigate = useNavigate();
    const { user, signOut, isLoading } = useAuth();

    const handleLogout = async () => {
        try {
            await signOut();
            showSuccess('Çıkış yapıldı. Görüşmek üzere! 👋');
        } catch {
            // Error handling is done in AuthProvider
        }
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="min-h-screen bg-[var(--color-background)] px-4 py-8">
            {/* Header */}
            <motion.header
                className="mb-8 flex items-center justify-between"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors"
                >
                    <ArrowLeft className="h-5 w-5" />
                    <span>Geri</span>
                </button>
                <Heart className="h-6 w-6 text-pink-500" fill="currentColor" />
            </motion.header>

            {/* Profile Card */}
            <motion.div
                className="mx-auto max-w-md"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                {/* Avatar & Name */}
                <div className="text-center mb-8">
                    <motion.div
                        className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-600 text-3xl font-bold text-white shadow-xl shadow-pink-500/30"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', delay: 0.2 }}
                    >
                        {user?.displayName ? getInitials(user.displayName) : '?'}
                    </motion.div>
                    <h1 className="text-2xl font-bold text-[var(--color-text)]">
                        {user?.displayName || 'Kullanıcı'}
                    </h1>
                    <p className="text-[var(--color-text-muted)]">Profil</p>
                </div>

                {/* Info Cards */}
                <div className="space-y-4 mb-8">
                    {/* Display Name */}
                    <motion.div
                        className="flex items-center gap-4 rounded-2xl bg-[var(--color-surface)] p-4"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/20">
                            <User className="h-6 w-6 text-purple-500" />
                        </div>
                        <div>
                            <p className="text-sm text-[var(--color-text-muted)]">Görünen Ad</p>
                            <p className="text-lg font-medium text-[var(--color-text)]">
                                {user?.displayName || '-'}
                            </p>
                        </div>
                    </motion.div>

                    {/* Email */}
                    <motion.div
                        className="flex items-center gap-4 rounded-2xl bg-[var(--color-surface)] p-4"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20">
                            <Mail className="h-6 w-6 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-sm text-[var(--color-text-muted)]">E-posta</p>
                            <p className="text-lg font-medium text-[var(--color-text)]">
                                {user?.email || '-'}
                            </p>
                        </div>
                    </motion.div>
                </div>

                {/* Logout Button */}
                <motion.button
                    onClick={handleLogout}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 rounded-2xl bg-red-500/10 border border-red-500/30 p-4 text-red-500 font-semibold hover:bg-red-500/20 transition-colors disabled:opacity-50"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <LogOut className="h-5 w-5" />
                    Çıkış Yap
                </motion.button>
            </motion.div>

            {/* Footer */}
            <motion.footer
                className="mt-12 text-center text-sm text-[var(--color-text-muted)]"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
            >
                <p>SyncLove 💕</p>
            </motion.footer>
        </div>
    );
}
