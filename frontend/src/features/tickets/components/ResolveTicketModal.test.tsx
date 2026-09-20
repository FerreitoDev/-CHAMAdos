import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ResolveTicketModal } from './ResolveTicketModal'
import { ticketsApi } from '../api/tickets.api'
import type { Ticket } from '../types/tickets.types'

vi.mock('../api/tickets.api', () => ({
  ticketsApi: {
    resolveTicket: vi.fn(),
  },
}))

describe('ResolveTicketModal', () => {
  const mockTicket: Ticket = {
    id: 'ticket-1',
    title: 'Monitor queimado',
    description: 'Não liga',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    requesterId: 'user-1',
    assigneeId: 'tech-1',
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
      name: 'User Test',
      email: 'user@test.com',
      role: 'USER',
      active: true,
      createdAt: '2026-09-20T00:00:00.000Z',
      updatedAt: '2026-09-20T00:00:00.000Z',
    },
    assignee: {
      id: 'tech-1',
      name: 'Tech Test',
      email: 'tech@test.com',
      role: 'TECHNICIAN',
      active: true,
      createdAt: '2026-09-20T00:00:00.000Z',
      updatedAt: '2026-09-20T00:00:00.000Z',
    },
  }

  const mockOnClose = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('não deve renderizar quando isOpen for false', () => {
    const { container } = render(
      <ResolveTicketModal
        isOpen={false}
        onClose={mockOnClose}
        ticketId="ticket-1"
        onSuccess={mockOnSuccess}
      />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('deve renderizar modal com título e textarea quando isOpen for true', () => {
    render(
      <ResolveTicketModal
        isOpen={true}
        onClose={mockOnClose}
        ticketId="ticket-1"
        ticketTitle="Monitor queimado"
        onSuccess={mockOnSuccess}
      />,
    )

    expect(screen.getByText('Resolver Chamado')).toBeInTheDocument()
    expect(screen.getByText('Monitor queimado')).toBeInTheDocument()
    expect(screen.getByLabelText(/notas da solução/i)).toBeInTheDocument()
  })

  it('deve submeter a resolução com notas da solução e fechar o modal', async () => {
    const resolvedTicket: Ticket = {
      ...mockTicket,
      status: 'RESOLVED',
      resolvedAt: '2026-09-20T01:00:00.000Z',
    }
    vi.mocked(ticketsApi.resolveTicket).mockResolvedValueOnce(resolvedTicket)

    render(
      <ResolveTicketModal
        isOpen={true}
        onClose={mockOnClose}
        ticketId="ticket-1"
        onSuccess={mockOnSuccess}
      />,
    )

    const textarea = screen.getByLabelText(/notas da solução/i)
    fireEvent.change(textarea, { target: { value: 'Troca de cabo de energia' } })

    const submitBtn = screen.getByRole('button', { name: /confirmar resolução/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(ticketsApi.resolveTicket).toHaveBeenCalledWith('ticket-1', {
        solutionNotes: 'Troca de cabo de energia',
      })
      expect(mockOnSuccess).toHaveBeenCalledWith(resolvedTicket)
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('deve exibir mensagem de erro se a API falhar', async () => {
    vi.mocked(ticketsApi.resolveTicket).mockRejectedValueOnce(new Error('Falha na resolução'))

    render(
      <ResolveTicketModal
        isOpen={true}
        onClose={mockOnClose}
        ticketId="ticket-1"
        onSuccess={mockOnSuccess}
      />,
    )

    const submitBtn = screen.getByRole('button', { name: /confirmar resolução/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText('Falha na resolução')).toBeInTheDocument()
      expect(mockOnSuccess).not.toHaveBeenCalled()
      expect(mockOnClose).not.toHaveBeenCalled()
    })
  })

  it('deve chamar onClose ao clicar no botão Cancelar', () => {
    render(
      <ResolveTicketModal
        isOpen={true}
        onClose={mockOnClose}
        ticketId="ticket-1"
        onSuccess={mockOnSuccess}
      />,
    )

    const cancelBtn = screen.getByRole('button', { name: /cancelar/i })
    fireEvent.click(cancelBtn)

    expect(mockOnClose).toHaveBeenCalled()
  })
})
