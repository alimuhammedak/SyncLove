/**
 * Main App component - the shell of the Couple Portal (SyncLove).
 * Wraps the app with providers and renders the dashboard or login.
 */
import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth, LoginPage } from './features/auth'
import { Heart } from 'lucide-react'
import './index.css'

// Lazy load game modules for code splitting
const Dashboard = lazy(() => import('./features/dashboard/index.tsx'))
const EmotionGame = lazy(() => import('./features/emotion-game/index.tsx'))

// React Query client for server state management
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
})

/**
 * Loading screen shown during lazy loading and auth check.
 */
function LoadingScreen() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-[var(--color-background)]">
      <div className="flex flex-col items-center gap-4">
        <Heart className="h-16 w-16 animate-pulse text-pink-500" />
        <p className="text-lg text-[var(--color-text-muted)]">Loading...</p>
      </div>
    </div>
  )
}

/**
 * App content that requires auth context.
 */
function AppContent() {
  const { isLoading, isAuthenticated } = useAuth()

  if (isLoading) {
    return <LoadingScreen />
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage />
  }

  // Show dashboard when authenticated
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/games" element={<EmotionGame />} />
        <Route path="/memory-book" element={<div className="p-8 text-center text-white">Memory Book Coming Soon!</div>} />
        <Route path="/settings" element={<div className="p-8 text-center text-white">Settings Coming Soon!</div>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

/**
 * Root App component with all providers.
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
