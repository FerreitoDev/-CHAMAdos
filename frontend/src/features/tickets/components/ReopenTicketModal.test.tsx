import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ReopenTicketModal } from './ReopenTicketModal'
import { ticketsApi } from '../api/tickets.api'
import type { Ticket } from '../types/tickets.types'

vi.mock('../api/tickets.api', () => ({
  ticketsApi: {
    reopenTicket: vi.fn(),
  },
}))

describe('ReopenTicketModal', () => {
  const mockTicket: Ticket = {
    id: 'ticket-1',
    title: 'Monitor queimado',
    description: 'Não liga',
    status: 'RESOLVED',
    priority: 'HIGH',
    requesterId: 'user-1',
    assigneeId: 'tech-1',
    categoryId: 'cat-1',
    createdAt: '2026-09-20T00:00:00.000Z',
    updatedAt: '2026-09-20T00:00:00.000Z',
    resolvedAt: '2026-09-20T01:00:00.000Z',
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
      <ReopenTicketModal
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
      <ReopenTicketModal
        isOpen={true}
        onClose={mockOnClose}
        ticketId="ticket-1"
        ticketTitle="Monitor queimado"
        onSuccess={mockOnSuccess}
      />,
    )

    expect(screen.getByText('Reabrir Chamado')).toBeInTheDocument()
    expect(screen.getByText('Monitor queimado')).toBeInTheDocument()
    expect(screen.getByLabelText(/motivo da reabertura/i)).toBeInTheDocument()
  })

  it('deve submeter a reabertura com motivo e fechar o modal', async () => {
    const reopenedTicket: Ticket = {
      ...mockTicket,
      status: 'OPEN',
      resolvedAt: null,
      closedAt: null,
    }
    vi.mocked(ticketsApi.reopenTicket).mockResolvedValueOnce(reopenedTicket)

    render(
      <ReopenTicketModal
        isOpen={true}
        onClose={mockOnClose}
        ticketId="ticket-1"
        onSuccess={mockOnSuccess}
      />,
    )

    const textarea = screen.getByLabelText(/motivo da reabertura/i)
    fireEvent.change(textarea, { target: { value: 'Monitor voltou a apagar' } })

    const submitBtn = screen.getByRole('button', { name: /confirmar reabertura/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(ticketsApi.reopenTicket).toHaveBeenCalledWith('ticket-1', {
        reopenReason: 'Monitor voltou a apagar',
      })
      expect(mockOnSuccess).toHaveBeenCalledWith(reopenedTicket)
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('deve exibir mensagem de erro se a API falhar', async () => {
    vi.mocked(ticketsApi.reopenTicket).mockRejectedValueOnce(new Error('Falha ao reabrir'))

    render(
      <ReopenTicketModal
        isOpen={true}
        onClose={mockOnClose}
        ticketId="ticket-1"
        onSuccess={mockOnSuccess}
      />,
    )

    const submitBtn = screen.getByRole('button', { name: /confirmar reabertura/i })
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText('Falha ao reabrir')).toBeInTheDocument()
      expect(mockOnSuccess).not.toHaveBeenCalled()
      expect(mockOnClose).not.toHaveBeenCalled()
    })
  })

  it('deve chamar onClose ao clicar no botão Cancelar', () => {
    render(
      <ReopenTicketModal
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
