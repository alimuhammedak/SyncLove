/**
 * Main App component - the shell of the Couple Portal.
 * Wraps the app with providers and renders the dashboard.
 */
import { Suspense, lazy } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from './features/auth'
import { Heart } from 'lucide-react'
import './index.css'

// Lazy load game modules for code splitting
const Dashboard = lazy(() => import('./features/dashboard/index.tsx'))

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
  const { isLoading } = useAuth()

  if (isLoading) {
    return <LoadingScreen />
  }

  // TODO: Add login screen when user is not authenticated
  // For now, show dashboard regardless of auth state (for development)
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Dashboard />
    </Suspense>
  )
}

/**
 * Root App component with all providers.
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
