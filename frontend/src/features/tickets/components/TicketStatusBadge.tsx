import React from 'react'
import type { TicketStatus } from '../types/tickets.types'

interface TicketStatusBadgeProps {
  status: TicketStatus
}

export const TicketStatusBadge: React.FC<TicketStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'OPEN':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full border bg-orange-100 text-orange-950 border-orange-200">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse" />
          Aberto
        </span>
      )
    case 'IN_PROGRESS':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full border bg-amber-100 text-amber-950 border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
          Em Atendimento
        </span>
      )
    case 'RESOLVED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full border bg-emerald-100 text-emerald-950 border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          Resolvido
        </span>
      )
    case 'CLOSED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-medium rounded-full border bg-zinc-100 text-zinc-800 border-zinc-200">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
          Encerrado
        </span>
      )
    default:
      return null
  }
}
