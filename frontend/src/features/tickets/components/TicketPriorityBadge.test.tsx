import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { TicketPriorityBadge } from './TicketPriorityBadge'

describe('TicketPriorityBadge', () => {
  it('deve renderizar a prioridade LOW como Baixa', () => {
    render(<TicketPriorityBadge priority="LOW" />)
    expect(screen.getByText('Baixa')).toBeInTheDocument()
  })

  it('deve renderizar a prioridade MEDIUM como Média', () => {
    render(<TicketPriorityBadge priority="MEDIUM" />)
    expect(screen.getByText('Média')).toBeInTheDocument()
  })

  it('deve renderizar a prioridade HIGH como Alta', () => {
    render(<TicketPriorityBadge priority="HIGH" />)
    expect(screen.getByText('Alta')).toBeInTheDocument()
  })

  it('deve renderizar a prioridade URGENT como Urgente', () => {
    render(<TicketPriorityBadge priority="URGENT" />)
    expect(screen.getByText('Urgente')).toBeInTheDocument()
  })
})
