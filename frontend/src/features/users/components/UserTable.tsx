import React from 'react'
import type { SafeUser } from '../types/users.types'
import { UserRoleBadge } from './UserRoleBadge'
import { UserStatusBadge } from './UserStatusBadge'
import { Button } from '@/components/ui/button'
import { Edit2, UserX, UserCheck } from 'lucide-react'

interface UserTableProps {
  users: SafeUser[]
  currentUserId?: string
  isLoading?: boolean
  onEdit?: (user: SafeUser) => void
  onDeactivate?: (user: SafeUser) => void
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  currentUserId,
  isLoading = false,
  onEdit,
  onDeactivate,
}) => {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    } catch {
      return dateString
    }
  }

  if (isLoading) {
    return (
      <div className="w-full py-12 text-center text-muted-foreground animate-pulse">
        Carregando lista de usuários...
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="w-full py-12 text-center text-muted-foreground border rounded-lg border-dashed">
        <UserCheck className="w-8 h-8 mx-auto mb-2 opacity-50" />
        Nenhum usuário encontrado.
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full text-left text-sm border-collapse">
        <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider border-b border-border">
          <tr>
            <th scope="col" className="px-6 py-3 font-semibold">
              Usuário
            </th>
            <th scope="col" className="px-6 py-3 font-semibold">
              Papel
            </th>
            <th scope="col" className="px-6 py-3 font-semibold">
              Status
            </th>
            <th scope="col" className="px-6 py-3 font-semibold">
              Data de Cadastro
            </th>
            <th scope="col" className="px-6 py-3 font-semibold text-right">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {users.map((user) => {
            const isSelf = user.id === currentUserId
            const isInactive = !user.active
            const canDeactivate = !isSelf && !isInactive

            return (
              <tr
                key={user.id}
                className="hover:bg-muted/30 transition-colors"
                data-testid={`user-row-${user.id}`}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="font-medium text-foreground flex items-center gap-1.5">
                      {user.name}
                      {isSelf && (
                        <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded font-semibold">
                          Você
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <UserRoleBadge role={user.role} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <UserStatusBadge active={user.active} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground">
                  {formatDate(user.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit?.(user)}
                      title="Editar usuário"
                      aria-label={`Editar ${user.name}`}
                    >
                      <Edit2 className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={!canDeactivate}
                      onClick={() => onDeactivate?.(user)}
                      title={
                        isSelf
                          ? 'Você não pode desativar sua própria conta'
                          : isInactive
                            ? 'Usuário já está inativo'
                            : 'Desativar usuário'
                      }
                      aria-label={`Desativar ${user.name}`}
                    >
                      <UserX
                        className={`w-4 h-4 ${
                          canDeactivate
                            ? 'text-destructive hover:text-destructive/80'
                            : 'text-muted-foreground/40'
                        }`}
                      />
                    </Button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
