import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ticketsApi } from '../api/tickets.api'
import { useAuth } from '@/features/auth/use-auth'
import type { Ticket } from '../types/tickets.types'
import type { AuthContextValue } from '@/features/auth/auth.types'
import { TicketDetailPage } from './TicketDetailPage'

vi.mock('../api/tickets.api', () => ({
  ticketsApi: {
    getTicketById: vi.fn(),
    assignTicket: vi.fn(),
    reassignTicket: vi.fn(),
    resolveTicket: vi.fn(),
    closeTicket: vi.fn(),
    reopenTicket: vi.fn(),
  },
}))

vi.mock('../api/comments.api', () => ({
  commentsApi: {
    getComments: vi.fn().mockResolvedValue([]),
    createComment: vi.fn(),
  },
}))

vi.mock('@/features/auth/use-auth', () => ({
  useAuth: vi.fn(),
}))

vi.mock('@/features/users/api/users.api', () => ({
  usersApi: {
    getUsers: vi.fn().mockResolvedValue([]),
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

describe('TicketDetailPage', () => {
  const mockTicket: Ticket = {
    id: 'ticket-123',
    title: 'Sem acesso a VPN',
    description: 'Não consigo me conectar a VPN corporativa',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    requesterId: 'user-1',
    assigneeId: 'tech-1',
    categoryId: 'cat-2',
    createdAt: '2026-09-20T10:00:00.000Z',
    updatedAt: '2026-09-20T10:30:00.000Z',
    resolvedAt: null,
    closedAt: null,
    category: {
      id: 'cat-2',
      name: 'Rede',
      description: 'Conectividade e VPN',
      active: true,
      createdAt: '2026-09-20T00:00:00.000Z',
      updatedAt: '2026-09-20T00:00:00.000Z',
    },
    requester: {
      id: 'user-1',
      name: 'Carlos Santos',
      email: 'carlos@test.com',
      role: 'USER',
      active: true,
      createdAt: '2026-09-20T00:00:00.000Z',
      updatedAt: '2026-09-20T00:00:00.000Z',
    },
    assignee: {
      id: 'tech-1',
      name: 'Técnico Suporte',
      email: 'suporte@test.com',
      role: 'TECHNICIAN',
      active: true,
      createdAt: '2026-09-20T00:00:00.000Z',
      updatedAt: '2026-09-20T00:00:00.000Z',
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'tech-1', email: 'suporte@test.com', role: 'TECHNICIAN' },
      accessToken: 'token',
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    } as AuthContextValue)
  })

  it('deve buscar e exibir os detalhes do chamado e botão de resolver para o técnico responsável', async () => {
    vi.mocked(ticketsApi.getTicketById).mockResolvedValueOnce(mockTicket)

    render(
      <MemoryRouter initialEntries={['/tickets/ticket-123']}>
        <Routes>
          <Route path="/tickets/:id" element={<TicketDetailPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByText('Sem acesso a VPN')).toBeInTheDocument()
    expect(screen.getByText('Não consigo me conectar a VPN corporativa')).toBeInTheDocument()
    expect(screen.getByText('Carlos Santos')).toBeInTheDocument()
    expect(screen.getByText('Técnico Suporte')).toBeInTheDocument()
    expect(screen.getByText('Rede')).toBeInTheDocument()
    expect(screen.getByText('Em Atendimento')).toBeInTheDocument()
    expect(screen.getByText('Alta')).toBeInTheDocument()
    expect(screen.getByText('Comentários')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /resolver chamado/i })).toBeInTheDocument()
  })

  it('deve exibir mensagem de erro se a busca do chamado falhar', async () => {
    vi.mocked(ticketsApi.getTicketById).mockRejectedValueOnce(
      new Error('Você não tem permissão para acessar este chamado'),
    )

    render(
      <MemoryRouter initialEntries={['/tickets/ticket-123']}>
        <Routes>
          <Route path="/tickets/:id" element={<TicketDetailPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(
      await screen.findByText('Você não tem permissão para acessar este chamado'),
    ).toBeInTheDocument()
  })

  it('deve navegar de volta para /tickets ao clicar no botão de voltar', async () => {
    vi.mocked(ticketsApi.getTicketById).mockResolvedValueOnce(mockTicket)

    render(
      <MemoryRouter initialEntries={['/tickets/ticket-123']}>
        <Routes>
          <Route path="/tickets/:id" element={<TicketDetailPage />} />
        </Routes>
      </MemoryRouter>,
    )

    const backButton = await screen.findByRole('button', { name: /voltar para chamados/i })
    fireEvent.click(backButton)

    expect(mockNavigate).toHaveBeenCalledWith('/tickets')
  })
})
