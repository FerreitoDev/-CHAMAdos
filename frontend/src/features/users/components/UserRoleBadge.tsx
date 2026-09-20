import React from 'react'
import type { UserRole } from '../types/users.types'
import { Shield, Wrench, User } from 'lucide-react'

interface UserRoleBadgeProps {
  role: UserRole
}

const roleConfig: Record<
  UserRole,
  { label: string; icon: React.ElementType; className: string }
> = {
  ADMIN: {
    label: 'Administrador',
    icon: Shield,
    className:
      'bg-amber-500/15 text-amber-400 border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-300',
  },
  TECHNICIAN: {
    label: 'Técnico',
    icon: Wrench,
    className:
      'bg-blue-500/15 text-blue-400 border-blue-500/30 dark:bg-blue-500/20 dark:text-blue-300',
  },
  USER: {
    label: 'Usuário',
    icon: User,
    className:
      'bg-zinc-500/15 text-zinc-400 border-zinc-500/30 dark:bg-zinc-500/20 dark:text-zinc-300',
  },
}

export const UserRoleBadge: React.FC<UserRoleBadgeProps> = ({ role }) => {
  const config = roleConfig[role] || roleConfig.USER
  const Icon = config.icon

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border transition-colors ${config.className}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  )
}
