import React from 'react'
import type { Ticket } from '../types/tickets.types'
import { TicketStatusBadge } from './TicketStatusBadge'
import { TicketPriorityBadge } from './TicketPriorityBadge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
      <div className="w-full py-12 text-center text-muted-foreground border rounded-xl border-dashed bg-card/50">
        <TicketIcon className="w-8 h-8 mx-auto mb-2 opacity-40 text-muted-foreground" />
        Nenhum chamado encontrado.
      </div>
    )
  }

  return (
    <div className="w-full rounded-xl border border-border bg-card shadow-xs overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-border bg-muted/40 hover:bg-muted/40">
            <TableHead className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Título / Categoria
            </TableHead>
            <TableHead className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Solicitante
            </TableHead>
            <TableHead className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Responsável
            </TableHead>
            <TableHead className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Prioridade
            </TableHead>
            <TableHead className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Status
            </TableHead>
            <TableHead className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Aberto em
            </TableHead>
            <TableHead className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Ações
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => (
            <TableRow
              key={ticket.id}
              className="border-b border-border/70 hover:bg-muted/30 transition-colors last:border-b-0"
              data-testid={`ticket-row-${ticket.id}`}
            >
              <TableCell className="px-5 py-3.5 max-w-xs">
                <div className="font-medium text-foreground truncate">{ticket.title}</div>
                <div className="text-xs text-muted-foreground">{ticket.category?.name || 'Sem categoria'}</div>
              </TableCell>
              <TableCell className="px-5 py-3.5 whitespace-nowrap text-xs text-muted-foreground">
                <div className="font-medium text-foreground">{ticket.requester?.name || 'Desconhecido'}</div>
                <div>{ticket.requester?.email}</div>
              </TableCell>
              <TableCell className="px-5 py-3.5 whitespace-nowrap text-xs text-muted-foreground">
                {ticket.assignee ? (
                  <div>
                    <div className="font-medium text-foreground">{ticket.assignee.name}</div>
                    <div>{ticket.assignee.email}</div>
                  </div>
                ) : (
                  <span className="italic text-muted-foreground/60">Sem responsável</span>
                )}
              </TableCell>
              <TableCell className="px-5 py-3.5 whitespace-nowrap">
                <TicketPriorityBadge priority={ticket.priority} />
              </TableCell>
              <TableCell className="px-5 py-3.5 whitespace-nowrap">
                <TicketStatusBadge status={ticket.status} />
              </TableCell>
              <TableCell className="px-5 py-3.5 whitespace-nowrap text-xs text-muted-foreground">
                {formatDate(ticket.createdAt)}
              </TableCell>
              <TableCell className="px-5 py-3.5 whitespace-nowrap text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewDetails?.(ticket)}
                  title="Ver detalhes do chamado"
                  aria-label={`Ver detalhes de ${ticket.title}`}
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
