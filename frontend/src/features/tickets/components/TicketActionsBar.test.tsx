import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { TicketActionsBar } from './TicketActionsBar'
import { ticketsApi } from '../api/tickets.api'
import { useAuth } from '@/features/auth/use-auth'
import type { Ticket } from '../types/tickets.types'
import type { AuthContextValue } from '@/features/auth/auth.types'

vi.mock('../api/tickets.api', () => ({
  ticketsApi: {
    assignTicket: vi.fn(),
    reassignTicket: vi.fn(),
    resolveTicket: vi.fn(),
    closeTicket: vi.fn(),
    reopenTicket: vi.fn(),
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

describe('TicketActionsBar', () => {
  const mockTicket: Ticket = {
    id: 'ticket-1',
    title: 'Erro de Login',
    description: 'Não conecta',
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
      name: 'Software',
      description: null,
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

  const mockOnTicketUpdated = vi.fn()

  const setAuthUser = (user: { id: string; email: string; role: 'USER' | 'TECHNICIAN' | 'ADMIN' } | null) => {
    vi.mocked(useAuth).mockReturnValue({
      user,
      accessToken: 'token',
      isAuthenticated: Boolean(user),
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    } as AuthContextValue)
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('não deve renderizar quando o usuário não estiver logado', () => {
    setAuthUser(null)

    const { container } = render(
      <TicketActionsBar ticket={mockTicket} onTicketUpdated={mockOnTicketUpdated} />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('deve exibir botão "Assumir Chamado" para técnico em chamado aberto e sem responsável', async () => {
    setAuthUser({ id: 'tech-1', email: 'tech@test.com', role: 'TECHNICIAN' })
    const updatedTicket: Ticket = { ...mockTicket, assigneeId: 'tech-1', status: 'IN_PROGRESS' }
    vi.mocked(ticketsApi.assignTicket).mockResolvedValueOnce(updatedTicket)

    render(<TicketActionsBar ticket={mockTicket} onTicketUpdated={mockOnTicketUpdated} />)

    const button = screen.getByRole('button', { name: /assumir chamado/i })
    expect(button).toBeInTheDocument()

    fireEvent.click(button)

    await waitFor(() => {
      expect(ticketsApi.assignTicket).toHaveBeenCalledWith('ticket-1')
      expect(mockOnTicketUpdated).toHaveBeenCalledWith(updatedTicket)
    })
  })

  it('deve exibir botão "Atribuir Técnico" para ADMIN em chamado aberto', async () => {
    setAuthUser({ id: 'admin-1', email: 'admin@test.com', role: 'ADMIN' })

    render(<TicketActionsBar ticket={mockTicket} onTicketUpdated={mockOnTicketUpdated} />)

    const button = screen.getByRole('button', { name: /atribuir técnico/i })
    expect(button).toBeInTheDocument()

    fireEvent.click(button)
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Atribuir Chamado' })).toBeInTheDocument()
    })
  })

  it('deve exibir botão "Resolver Chamado" para o técnico atribuído em chamado EM_ANDAMENTO', () => {
    setAuthUser({ id: 'tech-1', email: 'tech@test.com', role: 'TECHNICIAN' })
    const inProgressTicket: Ticket = { ...mockTicket, status: 'IN_PROGRESS', assigneeId: 'tech-1' }

    render(<TicketActionsBar ticket={inProgressTicket} onTicketUpdated={mockOnTicketUpdated} />)

    const button = screen.getByRole('button', { name: /resolver chamado/i })
    expect(button).toBeInTheDocument()

    fireEvent.click(button)
    expect(screen.getByRole('heading', { name: 'Resolver Chamado' })).toBeInTheDocument()
  })

  it('deve exibir botão "Encerrar Chamado" e "Reabrir Chamado" para ADMIN em chamado RESOLVIDO', () => {
    setAuthUser({ id: 'admin-1', email: 'admin@test.com', role: 'ADMIN' })
    const resolvedTicket: Ticket = { ...mockTicket, status: 'RESOLVED', resolvedAt: '2026-09-20T00:00:00.000Z' }

    render(<TicketActionsBar ticket={resolvedTicket} onTicketUpdated={mockOnTicketUpdated} />)

    expect(screen.getByRole('button', { name: /encerrar chamado/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reabrir chamado/i })).toBeInTheDocument()
  })

  it('deve exibir botão "Reabrir Chamado" para o solicitante (USER) em chamado RESOLVIDO', () => {
    setAuthUser({ id: 'user-1', email: 'user@test.com', role: 'USER' })
    const resolvedTicket: Ticket = { ...mockTicket, status: 'RESOLVED', requesterId: 'user-1' }

    render(<TicketActionsBar ticket={resolvedTicket} onTicketUpdated={mockOnTicketUpdated} />)

    const button = screen.getByRole('button', { name: /reabrir chamado/i })
    expect(button).toBeInTheDocument()

    fireEvent.click(button)
    expect(screen.getByRole('heading', { name: 'Reabrir Chamado' })).toBeInTheDocument()
  })

  it('não deve exibir ações para o solicitante (USER) em chamado EM_ANDAMENTO', () => {
    setAuthUser({ id: 'user-1', email: 'user@test.com', role: 'USER' })
    const inProgressTicket: Ticket = { ...mockTicket, status: 'IN_PROGRESS', requesterId: 'user-1' }

    const { container } = render(
      <TicketActionsBar ticket={inProgressTicket} onTicketUpdated={mockOnTicketUpdated} />,
    )
    expect(container.firstChild).toBeNull()
  })
})
