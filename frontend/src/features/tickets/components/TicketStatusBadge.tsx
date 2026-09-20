import React from 'react'
import type { TicketStatus } from '../types/tickets.types'

interface TicketStatusBadgeProps {
  status: TicketStatus
}

export const TicketStatusBadge: React.FC<TicketStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'OPEN':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border bg-blue-500/15 text-blue-400 border-blue-500/30 dark:bg-blue-500/20 dark:text-blue-300">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
          Aberto
        </span>
      )
    case 'IN_PROGRESS':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border bg-amber-500/15 text-amber-400 border-amber-500/30 dark:bg-amber-500/20 dark:text-amber-300">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          Em Atendimento
        </span>
      )
    case 'RESOLVED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border bg-emerald-500/15 text-emerald-400 border-emerald-500/30 dark:bg-emerald-500/20 dark:text-emerald-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Resolvido
        </span>
      )
    case 'CLOSED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border bg-zinc-500/15 text-zinc-400 border-zinc-500/30 dark:bg-zinc-500/20 dark:text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
          Encerrado
        </span>
      )
    default:
      return null
  }
}
