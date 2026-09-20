import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { ticketsApi } from '../api/tickets.api'
import { TicketFilterBar } from '../components/TicketFilterBar'
import { TicketTable } from '../components/TicketTable'
import { CreateTicketModal } from '../components/CreateTicketModal'
import type { CreateTicketPayload, Ticket, TicketPriority, TicketStatus } from '../types/tickets.types'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Plus, Ticket as TicketIcon } from 'lucide-react'

export const TicketsListPage: React.FC = () => {
  const navigate = useNavigate()

  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filter & Pagination States
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<TicketStatus | undefined>(undefined)
  const [priority, setPriority] = useState<TicketPriority | undefined>(undefined)
  const [categoryId, setCategoryId] = useState<string | undefined>(undefined)

  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  const fetchTickets = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await ticketsApi.getTickets({
        search: search || undefined,
        status,
        priority,
        categoryId,
        page,
        limit: 10,
      })

      setTickets(response.data)
      setTotal(response.meta.total)
      setTotalPages(response.meta.totalPages || 1)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Erro ao carregar chamados.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [search, status, priority, categoryId, page])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  const handleFilterChange = (filters: {
    search?: string
    status?: TicketStatus
    priority?: TicketPriority
    categoryId?: string
  }) => {
    setSearch(filters.search || '')
    setStatus(filters.status)
    setPriority(filters.priority)
    setCategoryId(filters.categoryId)
    setPage(1)
  }

  const handleClearFilters = () => {
    setSearch('')
    setStatus(undefined)
    setPriority(undefined)
    setCategoryId(undefined)
    setPage(1)
  }

  const handleCreateTicket = async (payload: CreateTicketPayload) => {
    await ticketsApi.createTicket(payload)
    await fetchTickets()
  }

  const handleViewDetails = (ticket: Ticket) => {
    navigate(`/tickets/${ticket.id}`)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <TicketIcon className="w-7 h-7 text-primary" />
            Chamados de Suporte
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Consulte, acompanhe e solicite atendimento para seus chamados.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Abrir Chamado
        </Button>
      </div>

      {/* Filter Bar */}
      <TicketFilterBar
        search={search}
        status={status}
        priority={priority}
        categoryId={categoryId}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-lg bg-destructive/15 border border-destructive/30 text-destructive text-sm">
          {error}
        </div>
      )}

      {/* Tickets Table */}
      <TicketTable tickets={tickets} isLoading={isLoading} onViewDetails={handleViewDetails} />

      {/* Pagination Controls */}
      {!isLoading && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
          <div>
            Exibindo página <span className="font-semibold text-foreground">{page}</span> de{' '}
            <span className="font-semibold text-foreground">{totalPages}</span> ({total} chamados no total)
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Anterior
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Próxima
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Modal de Criação */}
      <CreateTicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTicket}
      />
    </div>
  )
}
