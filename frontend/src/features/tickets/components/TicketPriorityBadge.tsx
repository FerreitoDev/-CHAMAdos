import React from 'react'
import type { TicketPriority } from '../types/tickets.types'

interface TicketPriorityBadgeProps {
  priority: TicketPriority
}

export const TicketPriorityBadge: React.FC<TicketPriorityBadgeProps> = ({ priority }) => {
  switch (priority) {
    case 'LOW':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
          Baixa
        </span>
      )
    case 'MEDIUM':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border bg-blue-500/10 text-blue-400 border-blue-500/30">
          Média
        </span>
      )
    case 'HIGH':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border bg-orange-500/10 text-orange-400 border-orange-500/30">
          Alta
        </span>
      )
    case 'URGENT':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full border bg-rose-500/15 text-rose-400 border-rose-500/30 animate-pulse">
          Urgente
        </span>
      )
    default:
      return null
  }
}
