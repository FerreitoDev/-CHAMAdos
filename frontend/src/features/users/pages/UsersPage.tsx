import React, { useState, useEffect, useCallback } from 'react'
import type {
  SafeUser,
  CreateUserPayload,
  UpdateUserPayload,
  UserRole,
} from '../types/users.types'
import { usersApi } from '../api/users.api'
import { useAuth } from '@/features/auth/use-auth'
import { UserTable } from '../components/UserTable'
import { CreateUserModal } from '../components/CreateUserModal'
import { EditUserModal } from '../components/EditUserModal'
import { DeactivateUserDialog } from '../components/DeactivateUserDialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserPlus, Search, Filter, AlertCircle, RefreshCw } from 'lucide-react'

export const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth()

  const [users, setUsers] = useState<SafeUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<'ALL' | UserRole>('ALL')

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<SafeUser | null>(null)
  const [deactivatingUser, setDeactivatingUser] = useState<SafeUser | null>(
    null
  )

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true)
      setFetchError(null)
      const data = await usersApi.getUsers()
      setUsers(data)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFetchError(err.message)
      } else {
        setFetchError('Não foi possível carregar a lista de usuários.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleCreateUser = async (payload: CreateUserPayload) => {
    const newUser = await usersApi.createUser(payload)
    setUsers((prev) => [newUser, ...prev])
  }

  const handleUpdateUser = async (id: string, payload: UpdateUserPayload) => {
    const updated = await usersApi.updateUser(id, payload)
    setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)))
  }

  const handleDeactivateUser = async (id: string) => {
    await usersApi.deactivateUser(id)
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, active: false } : u))
    )
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter

    return matchesSearch && matchesRole
  })

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Gerenciamento de Usuários
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Cadastre, edite papéis e gerencie o acesso de usuários no sistema.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          Novo Usuário
        </Button>
      </div>

      {/* Fetch Error Alert */}
      {fetchError && (
        <div className="p-4 rounded-xl bg-destructive/15 border border-destructive/30 text-destructive text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{fetchError}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Tentar Novamente
          </Button>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-muted-foreground hidden sm:inline" />
          <select
            value={roleFilter}
            onChange={(e) =>
              setRoleFilter(e.target.value as 'ALL' | UserRole)
            }
            className="w-full sm:w-48 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="ALL">Todos os Papéis</option>
            <option value="ADMIN">Administradores</option>
            <option value="TECHNICIAN">Técnicos</option>
            <option value="USER">Usuários</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <UserTable
        users={filteredUsers}
        currentUserId={currentUser?.id}
        isLoading={isLoading}
        onEdit={(userToEdit) => setEditingUser(userToEdit)}
        onDeactivate={(userToDeactivate) =>
          setDeactivatingUser(userToDeactivate)
        }
      />

      {/* Modals */}
      <CreateUserModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateUser}
      />

      <EditUserModal
        isOpen={Boolean(editingUser)}
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSubmit={handleUpdateUser}
      />

      <DeactivateUserDialog
        isOpen={Boolean(deactivatingUser)}
        user={deactivatingUser}
        onClose={() => setDeactivatingUser(null)}
        onConfirm={handleDeactivateUser}
      />
    </div>
  )
}
