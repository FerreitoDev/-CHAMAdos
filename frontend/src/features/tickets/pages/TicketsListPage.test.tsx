import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ticketsApi } from '../api/tickets.api'
import type { PaginatedTicketsResponse, Ticket } from '../types/tickets.types'
import { TicketsListPage } from './TicketsListPage'

vi.mock('../api/tickets.api', () => ({
  ticketsApi: {
    getTickets: vi.fn(),
    createTicket: vi.fn(),
  },
}))

vi.mock('@/features/categories/api/categories.api', () => ({
  categoriesApi: {
    getCategories: vi.fn().mockResolvedValue([]),
  },
}))

const mockNavigate = vi.fn()
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('TicketsListPage', () => {
  const mockTicket: Ticket = {
    id: 'ticket-1',
    title: 'Teclado sem funcionar',
    description: 'Algumas teclas pararam',
    status: 'OPEN',
    priority: 'MEDIUM',
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
      description: null,
      active: true,
      createdAt: '2026-09-20T00:00:00.000Z',
      updatedAt: '2026-09-20T00:00:00.000Z',
    },
    requester: {
      id: 'user-1',
      name: 'Maria Souza',
      email: 'maria@test.com',
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

  it('deve buscar e renderizar a lista de chamados ao carregar a página', async () => {
    vi.mocked(ticketsApi.getTickets).mockResolvedValueOnce(mockPaginatedResponse)

    render(
      <MemoryRouter>
        <TicketsListPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Chamados de Suporte')).toBeInTheDocument()
    expect(await screen.findByText('Teclado sem funcionar')).toBeInTheDocument()
    expect(screen.getByText('Maria Souza')).toBeInTheDocument()
  })

  it('deve abrir o modal de criação ao clicar no botão Abrir Chamado', async () => {
    vi.mocked(ticketsApi.getTickets).mockResolvedValueOnce(mockPaginatedResponse)

    render(
      <MemoryRouter>
        <TicketsListPage />
      </MemoryRouter>,
    )

    const openModalButton = await screen.findByRole('button', { name: /abrir chamado/i })
    fireEvent.click(openModalButton)

    expect(await screen.findByTestId('create-ticket-modal')).toBeInTheDocument()
  })

  it('deve navegar para a página de detalhes ao clicar no botão de ver detalhes', async () => {
    vi.mocked(ticketsApi.getTickets).mockResolvedValueOnce(mockPaginatedResponse)

    render(
      <MemoryRouter>
        <TicketsListPage />
      </MemoryRouter>,
    )

    const detailsButton = await screen.findByLabelText('Ver detalhes de Teclado sem funcionar')
    fireEvent.click(detailsButton)

    expect(mockNavigate).toHaveBeenCalledWith('/tickets/ticket-1')
  })
})
