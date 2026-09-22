import { Outlet, useLocation } from 'react-router'

import { useAuth } from '@/features/auth/use-auth'
import { AppHeader } from './AppHeader'

export function AppLayout() {
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  // Telas não autenticadas ou rota direta de login não exibem o AppHeader corporativo
  if (location.pathname === '/login' || !isAuthenticated) {
    return <Outlet />
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <AppHeader />
      <main className="mx-auto flex-1 w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  )
}
