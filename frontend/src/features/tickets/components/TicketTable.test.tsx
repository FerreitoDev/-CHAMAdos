import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Ticket } from '../types/tickets.types'
import { TicketTable } from './TicketTable'

describe('TicketTable', () => {
  const mockTicket: Ticket = {
    id: 'ticket-1',
    title: 'Erro de Login',
    description: 'Não consigo logar na conta',
    status: 'OPEN',
    priority: 'HIGH',
    requesterId: 'user-1',
    assigneeId: null,
    categoryId: 'cat-1',
    createdAt: '2026-09-20T10:00:00.000Z',
    updatedAt: '2026-09-20T10:00:00.000Z',
    resolvedAt: null,
    closedAt: null,
    category: {
      id: 'cat-1',
      name: 'Software',
      description: 'Sistemas',
      active: true,
      createdAt: '2026-09-20T00:00:00.000Z',
      updatedAt: '2026-09-20T00:00:00.000Z',
    },
    requester: {
      id: 'user-1',
      name: 'João Silva',
      email: 'joao@test.com',
      role: 'USER',
      active: true,
      createdAt: '2026-09-20T00:00:00.000Z',
      updatedAt: '2026-09-20T00:00:00.000Z',
    },
    assignee: null,
  }

  it('deve exibir mensagem de carregamento quando isLoading for true', () => {
    render(<TicketTable tickets={[]} isLoading={true} />)
    expect(screen.getByText('Carregando lista de chamados...')).toBeInTheDocument()
  })

  it('deve exibir mensagem quando a lista de chamados estiver vazia', () => {
    render(<TicketTable tickets={[]} isLoading={false} />)
    expect(screen.getByText('Nenhum chamado encontrado.')).toBeInTheDocument()
  })

  it('deve renderizar os chamados corretamente na tabela', () => {
    render(<TicketTable tickets={[mockTicket]} />)

    expect(screen.getByText('Erro de Login')).toBeInTheDocument()
    expect(screen.getByText('Software')).toBeInTheDocument()
    expect(screen.getByText('João Silva')).toBeInTheDocument()
    expect(screen.getByText('Sem responsável')).toBeInTheDocument()
    expect(screen.getByText('Alta')).toBeInTheDocument()
    expect(screen.getByText('Aberto')).toBeInTheDocument()
  })

  it('deve disparar onViewDetails ao clicar no botão de detalhes', () => {
    const onViewDetails = vi.fn()
    render(<TicketTable tickets={[mockTicket]} onViewDetails={onViewDetails} />)

    const button = screen.getByLabelText('Ver detalhes de Erro de Login')
    fireEvent.click(button)

    expect(onViewDetails).toHaveBeenCalledWith(mockTicket)
  })
})
