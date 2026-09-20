import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '@/shared/api/client'
import { ticketsApi } from './tickets.api'
import type { PaginatedTicketsResponse, Ticket } from '../types/tickets.types'

vi.mock('@/shared/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}))

describe('ticketsApi', () => {
  const mockTicket: Ticket = {
    id: 'ticket-1',
    title: 'Monitor queimado',
    description: 'O monitor não liga mais',
    status: 'OPEN',
    priority: 'HIGH',
    requesterId: 'user-1',
    assigneeId: null,
    categoryId: 'cat-1',
    createdAt: '2026-09-20T00:00:00.000Z',
    updatedAt: '2026-09-20T00:00:00.000Z',
    resolvedAt: null,
    closedAt: null,
    category: {
      id: 'cat-1',
      name: 'Hardware',
      description: 'Equipamentos',
      active: true,
      createdAt: '2026-09-20T00:00:00.000Z',
      updatedAt: '2026-09-20T00:00:00.000Z',
    },
    requester: {
      id: 'user-1',
      name: 'User Test',
      email: 'user@test.com',
      role: 'USER',
      active: true,
      createdAt: '2026-09-20T00:00:00.000Z',
      updatedAt: '2026-09-20T00:00:00.000Z',
    },
    assignee: null,
  }

  const mockPaginatedResponse: PaginatedTicketsResponse = {
    data: [mockTicket],
    meta: {
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getTickets deve chamar GET /tickets sem params por padrão', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockPaginatedResponse })

    const result = await ticketsApi.getTickets()

    expect(apiClient.get).toHaveBeenCalledWith('/tickets', { params: undefined })
    expect(result).toEqual(mockPaginatedResponse)
  })

  it('getTickets deve chamar GET /tickets com os filtros informados', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockPaginatedResponse })

    const params = { status: 'OPEN' as const, page: 2, limit: 10 }
    const result = await ticketsApi.getTickets(params)

    expect(apiClient.get).toHaveBeenCalledWith('/tickets', { params })
    expect(result).toEqual(mockPaginatedResponse)
  })

  it('getTicketById deve chamar GET /tickets/:id e retornar o chamado', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockTicket })

    const result = await ticketsApi.getTicketById('ticket-1')

    expect(apiClient.get).toHaveBeenCalledWith('/tickets/ticket-1')
    expect(result).toEqual(mockTicket)
  })

  it('createTicket deve chamar POST /tickets com o payload e retornar o chamado criado', async () => {
    const payload = {
      title: 'Monitor queimado',
      description: 'O monitor não liga mais',
      priority: 'HIGH' as const,
      categoryId: 'cat-1',
    }
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockTicket })

    const result = await ticketsApi.createTicket(payload)

    expect(apiClient.post).toHaveBeenCalledWith('/tickets', payload)
    expect(result).toEqual(mockTicket)
  })

  it('assignTicket deve chamar PATCH /tickets/:id/assign com o payload', async () => {
    const assignedTicket = { ...mockTicket, status: 'IN_PROGRESS' as const, assigneeId: 'tech-1' }
    vi.mocked(apiClient.patch).mockResolvedValueOnce({ data: assignedTicket })

    const payload = { assigneeId: 'tech-1' }
    const result = await ticketsApi.assignTicket('ticket-1', payload)

    expect(apiClient.patch).toHaveBeenCalledWith('/tickets/ticket-1/assign', payload)
    expect(result).toEqual(assignedTicket)
  })

  it('reassignTicket deve chamar PATCH /tickets/:id/reassign com o payload', async () => {
    const reassignedTicket = { ...mockTicket, status: 'IN_PROGRESS' as const, assigneeId: 'tech-2' }
    vi.mocked(apiClient.patch).mockResolvedValueOnce({ data: reassignedTicket })

    const payload = { assigneeId: 'tech-2' }
    const result = await ticketsApi.reassignTicket('ticket-1', payload)

    expect(apiClient.patch).toHaveBeenCalledWith('/tickets/ticket-1/reassign', payload)
    expect(result).toEqual(reassignedTicket)
  })

  it('resolveTicket deve chamar PATCH /tickets/:id/resolve com o payload', async () => {
    const resolvedTicket = { ...mockTicket, status: 'RESOLVED' as const, resolvedAt: '2026-09-20T01:00:00.000Z' }
    vi.mocked(apiClient.patch).mockResolvedValueOnce({ data: resolvedTicket })

    const payload = { solutionNotes: 'Troca da fonte realizada' }
    const result = await ticketsApi.resolveTicket('ticket-1', payload)

    expect(apiClient.patch).toHaveBeenCalledWith('/tickets/ticket-1/resolve', payload)
    expect(result).toEqual(resolvedTicket)
  })

  it('closeTicket deve chamar PATCH /tickets/:id/close', async () => {
    const closedTicket = { ...mockTicket, status: 'CLOSED' as const, closedAt: '2026-09-20T02:00:00.000Z' }
    vi.mocked(apiClient.patch).mockResolvedValueOnce({ data: closedTicket })

    const result = await ticketsApi.closeTicket('ticket-1')

    expect(apiClient.patch).toHaveBeenCalledWith('/tickets/ticket-1/close')
    expect(result).toEqual(closedTicket)
  })

  it('reopenTicket deve chamar PATCH /tickets/:id/reopen com o payload', async () => {
    const reopenedTicket = { ...mockTicket, status: 'OPEN' as const, resolvedAt: null, closedAt: null }
    vi.mocked(apiClient.patch).mockResolvedValueOnce({ data: reopenedTicket })

    const payload = { reopenReason: 'Problema voltou a ocorrer' }
    const result = await ticketsApi.reopenTicket('ticket-1', payload)

    expect(apiClient.patch).toHaveBeenCalledWith('/tickets/ticket-1/reopen', payload)
    expect(result).toEqual(reopenedTicket)
  })
})
