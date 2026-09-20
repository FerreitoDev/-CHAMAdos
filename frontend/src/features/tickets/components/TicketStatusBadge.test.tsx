import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TicketStatusBadge } from './TicketStatusBadge'

describe('TicketStatusBadge', () => {
  it('deve renderizar o status OPEN como Aberto', () => {
    render(<TicketStatusBadge status="OPEN" />)
    expect(screen.getByText('Aberto')).toBeInTheDocument()
  })

  it('deve renderizar o status IN_PROGRESS como Em Atendimento', () => {
    render(<TicketStatusBadge status="IN_PROGRESS" />)
    expect(screen.getByText('Em Atendimento')).toBeInTheDocument()
  })

  it('deve renderizar o status RESOLVED como Resolvido', () => {
    render(<TicketStatusBadge status="RESOLVED" />)
    expect(screen.getByText('Resolvido')).toBeInTheDocument()
  })

  it('deve renderizar o status CLOSED como Encerrado', () => {
    render(<TicketStatusBadge status="CLOSED" />)
    expect(screen.getByText('Encerrado')).toBeInTheDocument()
  })
})
