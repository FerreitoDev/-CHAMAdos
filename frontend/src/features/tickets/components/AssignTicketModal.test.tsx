import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { AssignTicketModal } from './AssignTicketModal'
import { ticketsApi } from '../api/tickets.api'
import { usersApi } from '@/features/users/api/users.api'
import type { Ticket } from '../types/tickets.types'
import type { SafeUser } from '@/features/users/types/users.types'

vi.mock('../api/tickets.api', () => ({
  ticketsApi: {
    assignTicket: vi.fn(),
    reassignTicket: vi.fn(),
  },
}))

vi.mock('@/features/users/api/users.api', () => ({
  usersApi: {
    getUsers: vi.fn(),
  },
}))

describe('AssignTicketModal', () => {
  const mockTechs: SafeUser[] = [
    {
      id: 'tech-1',
      name: 'Carlos Tech',
      email: 'carlos@test.com',
      role: 'TECHNICIAN',
      active: true,
      createdAt: '2026-09-20T00:00:00.000Z',
      updatedAt: '2026-09-20T00:00:00.000Z',
    },
    {
      id: 'tech-2',
      name: 'Mariana Admin',
      email: 'mariana@test.com',
      role: 'ADMIN',
      active: true,
      createdAt: '2026-09-20T00:00:00.000Z',
      updatedAt: '2026-09-20T00:00:00.000Z',
    },
    {
      id: 'user-common',
      name: 'Joao User',
      email: 'joao@test.com',
      role: 'USER',
      active: true,
      createdAt: '2026-09-20T00:00:00.000Z',
      updatedAt: '2026-09-20T00:00:00.000Z',
    },
  ]

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

  const mockOnClose = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(usersApi.getUsers).mockResolvedValue(mockTechs)
  })

  it('não deve renderizar quando isOpen for false', () => {
    const { container } = render(
      <AssignTicketModal
        isOpen={false}
        onClose={mockOnClose}
        ticketId="ticket-1"
        onSuccess={mockOnSuccess}
      />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('deve renderizar no modo "Atribuir Chamado" quando não houver currentAssigneeId', async () => {
    render(
      <AssignTicketModal
        isOpen={true}
        onClose={mockOnClose}
        ticketId="ticket-1"
        ticketTitle="Erro de Login"
        onSuccess={mockOnSuccess}
      />,
    )

    expect(screen.getByText('Atribuir Chamado')).toBeInTheDocument()
    expect(screen.getByText('Erro de Login')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByText(/carlos tech/i)).toBeInTheDocument()
      expect(screen.getByText(/mariana admin/i)).toBeInTheDocument()
      // Usuário comum com role 'USER' não deve ser listado
      expect(screen.queryByText(/joao user/i)).not.toBeInTheDocument()
    })
  })

  it('deve renderizar no modo "Reatribuir Chamado" quando houver currentAssigneeId', async () => {
    render(
      <AssignTicketModal
        isOpen={true}
        onClose={mockOnClose}
        ticketId="ticket-1"
        currentAssigneeId="tech-1"
        onSuccess={mockOnSuccess}
        technicians={mockTechs}
      />,
    )

    expect(screen.getByText('Reatribuir Chamado')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /reatribuir/i })).toBeInTheDocument()
  })

  it('deve exibir mensagem de validação se tentar salvar sem selecionar técnico', async () => {
    render(
      <AssignTicketModal
        isOpen={true}
        onClose={mockOnClose}
        ticketId="ticket-1"
        onSuccess={mockOnSuccess}
        technicians={mockTechs}
      />,
    )

    const submitBtn = screen.getByRole('button', { name: /atribuir/i })
    fireEvent.click(submitBtn)

    expect(await screen.findByText('Selecione um técnico responsável.')).toBeInTheDocument()
    expect(ticketsApi.assignTicket).not.toHaveBeenCalled()
  })

  it('deve chamar ticketsApi.assignTicket no modo atribuição e fechar modal', async () => {
    const updatedTicket: Ticket = {
      ...mockTicket,
      assigneeId: 'tech-1',
      status: 'IN_PROGRESS',
    }
    vi.mocked(ticketsApi.assignTicket).mockResolvedValueOnce(updatedTicket)

    render(
      <AssignTicketModal
        isOpen={true}
        onClose={mockOnClose}
        ticketId="ticket-1"
        onSuccess={mockOnSuccess}
        technicians={mockTechs}
      />,
    )

    const select = screen.getByLabelText(/técnico responsável/i)
    fireEvent.change(select, { target: { value: 'tech-1' } })

    const submitBtn = screen.getByRole('button', { name: /atribuir/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(ticketsApi.assignTicket).toHaveBeenCalledWith('ticket-1', { assigneeId: 'tech-1' })
      expect(mockOnSuccess).toHaveBeenCalledWith(updatedTicket)
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('deve chamar ticketsApi.reassignTicket no modo reatribuição e fechar modal', async () => {
    const updatedTicket: Ticket = {
      ...mockTicket,
      assigneeId: 'tech-2',
      status: 'IN_PROGRESS',
    }
    vi.mocked(ticketsApi.reassignTicket).mockResolvedValueOnce(updatedTicket)

    render(
      <AssignTicketModal
        isOpen={true}
        onClose={mockOnClose}
        ticketId="ticket-1"
        currentAssigneeId="tech-1"
        onSuccess={mockOnSuccess}
        technicians={mockTechs}
      />,
    )

    const select = screen.getByLabelText(/técnico responsável/i)
    fireEvent.change(select, { target: { value: 'tech-2' } })

    const submitBtn = screen.getByRole('button', { name: /reatribuir/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(ticketsApi.reassignTicket).toHaveBeenCalledWith('ticket-1', { assigneeId: 'tech-2' })
      expect(mockOnSuccess).toHaveBeenCalledWith(updatedTicket)
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('deve exibir mensagem de erro se a API falhar', async () => {
    vi.mocked(ticketsApi.assignTicket).mockRejectedValueOnce(new Error('Técnico inativo'))

    render(
      <AssignTicketModal
        isOpen={true}
        onClose={mockOnClose}
        ticketId="ticket-1"
        onSuccess={mockOnSuccess}
        technicians={mockTechs}
      />,
    )

    const select = screen.getByLabelText(/técnico responsável/i)
    fireEvent.change(select, { target: { value: 'tech-1' } })

    const submitBtn = screen.getByRole('button', { name: /atribuir/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText('Técnico inativo')).toBeInTheDocument()
      expect(mockOnSuccess).not.toHaveBeenCalled()
      expect(mockOnClose).not.toHaveBeenCalled()
    })
  })

  it('deve chamar onClose ao clicar no botão Cancelar', () => {
    render(
      <AssignTicketModal
        isOpen={true}
        onClose={mockOnClose}
        ticketId="ticket-1"
        onSuccess={mockOnSuccess}
        technicians={mockTechs}
      />,
    )

    const cancelBtn = screen.getByRole('button', { name: /cancelar/i })
    fireEvent.click(cancelBtn)

    expect(mockOnClose).toHaveBeenCalled()
  })
})
