import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiClient } from '@/shared/api/client'
import { ticketsApi } from './tickets.api'
import type { PaginatedTicketsResponse, Ticket } from '../types/tickets.types'

vi.mock('@/shared/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
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
})
