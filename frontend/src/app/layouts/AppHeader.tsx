import { Link, NavLink } from 'react-router'
import { Flame, LogOut } from 'lucide-react'

import { useAuth } from '@/features/auth/use-auth'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function AppHeader() {
  const { user, logout } = useAuth()

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
      isActive
        ? 'bg-orange-50 text-primary font-semibold border border-orange-200/60 shadow-2xs'
        : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
    )

  const getRoleBadge = () => {
    if (!user) return null

    switch (user.role) {
      case 'ADMIN':
        return <Badge variant="default">Administrador</Badge>
      case 'TECHNICIAN':
        return <Badge variant="secondary">Técnico</Badge>
      case 'USER':
      default:
        return <Badge variant="outline">Usuário</Badge>
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-card/95 backdrop-blur-xs shadow-2xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Zona da Marca */}
        <div className="flex items-center gap-6">
          <Link
            to="/tickets"
            aria-label="CHAMAdos - Página Inicial"
            className="flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg"
          >
            <div className="flex size-9 items-center justify-center rounded-lg border border-orange-200 bg-orange-100 text-primary shadow-2xs">
              <Flame className="size-5 text-primary" />
            </div>
            <span className="text-lg font-bold tracking-tight text-foreground">
              CHAMAdos
            </span>
          </Link>

          {/* Zona de Navegação RBAC */}
          <nav className="hidden items-center gap-1 sm:flex" aria-label="Navegação Principal">
            <NavLink to="/tickets" className={navLinkClass}>
              Chamados
            </NavLink>

            {user?.role === 'ADMIN' && (
              <>
                <NavLink to="/categories" className={navLinkClass}>
                  Categorias
                </NavLink>
                <NavLink to="/users" className={navLinkClass}>
                  Usuários
                </NavLink>
              </>
            )}
          </nav>
        </div>

        {/* Zona de Perfil & Sessão */}
        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden flex-col items-end text-right sm:flex">
              <span className="max-w-[200px] truncate text-sm font-medium text-foreground">
                {user.email}
              </span>
              <div className="mt-0.5">{getRoleBadge()}</div>
            </div>

            <div className="sm:hidden">{getRoleBadge()}</div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => logout()}
              className="gap-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              title="Encerrar sessão"
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
