import React from 'react'
import type { TicketPriority } from '../types/tickets.types'

interface TicketPriorityBadgeProps {
  priority: TicketPriority
}

export const TicketPriorityBadge: React.FC<TicketPriorityBadgeProps> = ({ priority }) => {
  switch (priority) {
    case 'LOW':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border bg-emerald-100 text-emerald-900 border-emerald-200">
          Baixa
        </span>
      )
    case 'MEDIUM':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border bg-blue-100 text-blue-900 border-blue-200">
          Média
        </span>
      )
    case 'HIGH':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border bg-orange-100 text-orange-900 border-orange-200">
          Alta
        </span>
      )
    case 'URGENT':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full border bg-red-100 text-red-900 border-red-200 animate-pulse">
          Urgente
        </span>
      )
    default:
      return null
  }
}
