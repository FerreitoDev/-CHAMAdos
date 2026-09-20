import React from 'react'
import type { Ticket } from '../types/tickets.types'
import { TicketStatusBadge } from './TicketStatusBadge'
import { TicketPriorityBadge } from './TicketPriorityBadge'
import { Button } from '@/components/ui/button'
import { Eye, Ticket as TicketIcon } from 'lucide-react'

interface TicketTableProps {
  tickets: Ticket[]
  isLoading?: boolean
  onViewDetails?: (ticket: Ticket) => void
}

export const TicketTable: React.FC<TicketTableProps> = ({
  tickets,
  isLoading = false,
  onViewDetails,
}) => {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateString
    }
  }

  if (isLoading) {
    return (
      <div className="w-full py-12 text-center text-muted-foreground animate-pulse">
        Carregando lista de chamados...
      </div>
    )
  }

  if (tickets.length === 0) {
    return (
      <div className="w-full py-12 text-center text-muted-foreground border rounded-lg border-dashed">
        <TicketIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
        Nenhum chamado encontrado.
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full text-left text-sm border-collapse">
        <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider border-b border-border">
          <tr>
            <th scope="col" className="px-6 py-3 font-semibold">
              Título / Categoria
            </th>
            <th scope="col" className="px-6 py-3 font-semibold">
              Solicitante
            </th>
            <th scope="col" className="px-6 py-3 font-semibold">
              Responsável
            </th>
            <th scope="col" className="px-6 py-3 font-semibold">
              Prioridade
            </th>
            <th scope="col" className="px-6 py-3 font-semibold">
              Status
            </th>
            <th scope="col" className="px-6 py-3 font-semibold">
              Aberto em
            </th>
            <th scope="col" className="px-6 py-3 font-semibold text-right">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {tickets.map((ticket) => (
            <tr
              key={ticket.id}
              className="hover:bg-muted/30 transition-colors"
              data-testid={`ticket-row-${ticket.id}`}
            >
              <td className="px-6 py-4 max-w-xs">
                <div className="font-medium text-foreground truncate">{ticket.title}</div>
                <div className="text-xs text-muted-foreground">{ticket.category?.name || 'Sem categoria'}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground">
                <div className="font-medium text-foreground">{ticket.requester?.name || 'Desconhecido'}</div>
                <div>{ticket.requester?.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground">
                {ticket.assignee ? (
                  <div>
                    <div className="font-medium text-foreground">{ticket.assignee.name}</div>
                    <div>{ticket.assignee.email}</div>
                  </div>
                ) : (
                  <span className="italic text-muted-foreground/60">Sem responsável</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <TicketPriorityBadge priority={ticket.priority} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <TicketStatusBadge status={ticket.status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-xs text-muted-foreground">
                {formatDate(ticket.createdAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails?.(ticket)}
                  title="Ver detalhes do chamado"
                  aria-label={`Ver detalhes de ${ticket.title}`}
                >
                  <Eye className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
