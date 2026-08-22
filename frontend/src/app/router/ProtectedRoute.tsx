import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '@/features/auth/use-auth'

export function ProtectedRoute() {
    const { isAuthenticated, isLoading } = useAuth()
    const location = useLocation()

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-2">
                    {/* Spinner simples com Tailwind */}
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-sm text-muted-foreground">Carregando sessão...</p>
                </div>
            </div>
        )
    }

    if (!isAuthenticated) {
        // Redireciona para o login salvando a URL que o usuário tentou acessar
        // para um redirecionamento pós-login (ainda não implementado, mas deixa preparado)
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    // Renderiza a rota filha se autenticado
    return <Outlet />
}
