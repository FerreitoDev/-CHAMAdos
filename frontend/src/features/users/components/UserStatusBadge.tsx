import React from 'react'

interface UserStatusBadgeProps {
  active: boolean
}

export const UserStatusBadge: React.FC<UserStatusBadgeProps> = ({ active }) => {
  if (active) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border bg-emerald-500/15 text-emerald-400 border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-300">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Ativo
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border bg-zinc-500/15 text-zinc-400 border-zinc-500/30 dark:bg-zinc-500/20 dark:text-zinc-400">
      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
      Inativo
    </span>
  )
}
