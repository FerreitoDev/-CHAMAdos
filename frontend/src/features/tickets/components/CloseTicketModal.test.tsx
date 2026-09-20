import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { CloseTicketModal } from './CloseTicketModal'
import { ticketsApi } from '../api/tickets.api'
import type { Ticket } from '../types/tickets.types'

vi.mock('../api/tickets.api', () => ({
  ticketsApi: {
    closeTicket: vi.fn(),
  },
}))

describe('CloseTicketModal', () => {
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
      <CloseTicketModal
        isOpen={false}
        onClose={mockOnClose}
        ticketId="ticket-1"
        onSuccess={mockOnSuccess}
      />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('deve renderizar o modal com texto de alerta quando isOpen for true', () => {
    render(
      <CloseTicketModal
        isOpen={true}
        onClose={mockOnClose}
        ticketId="ticket-1"
        ticketTitle="Monitor queimado"
        onSuccess={mockOnSuccess}
      />,
    )

    expect(screen.getByText('Encerrar Chamado')).toBeInTheDocument()
    expect(screen.getByText('Monitor queimado')).toBeInTheDocument()
    expect(screen.getByText(/encerrar definitivamente/i)).toBeInTheDocument()
  })

  it('deve submeter o encerramento com sucesso e fechar o modal', async () => {
    const closedTicket: Ticket = {
      ...mockTicket,
      status: 'CLOSED',
      closedAt: '2026-09-20T02:00:00.000Z',
    }
    vi.mocked(ticketsApi.closeTicket).mockResolvedValueOnce(closedTicket)

    render(
      <CloseTicketModal
        isOpen={true}
        onClose={mockOnClose}
        ticketId="ticket-1"
        onSuccess={mockOnSuccess}
      />,
    )

    const confirmBtn = screen.getByRole('button', { name: /confirmar encerramento/i })
    fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(ticketsApi.closeTicket).toHaveBeenCalledWith('ticket-1')
      expect(mockOnSuccess).toHaveBeenCalledWith(closedTicket)
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  it('deve exibir mensagem de erro se a API falhar', async () => {
    vi.mocked(ticketsApi.closeTicket).mockRejectedValueOnce(new Error('Erro ao encerrar'))

    render(
      <CloseTicketModal
        isOpen={true}
        onClose={mockOnClose}
        ticketId="ticket-1"
        onSuccess={mockOnSuccess}
      />,
    )

    const confirmBtn = screen.getByRole('button', { name: /confirmar encerramento/i })
    fireEvent.click(confirmBtn)

    await waitFor(() => {
      expect(screen.getByText('Erro ao encerrar')).toBeInTheDocument()
      expect(mockOnSuccess).not.toHaveBeenCalled()
      expect(mockOnClose).not.toHaveBeenCalled()
    })
  })

  it('deve chamar onClose ao clicar no botão Cancelar', () => {
    render(
      <CloseTicketModal
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
