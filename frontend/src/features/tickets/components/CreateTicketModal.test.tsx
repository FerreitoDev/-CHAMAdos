import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Category } from '@/features/categories/types/categories.types'
import { CreateTicketModal } from './CreateTicketModal'

describe('CreateTicketModal', () => {
  const mockCategories: Category[] = [
    {
      id: 'cat-1',
      name: 'Hardware',
      description: null,
      active: true,
      createdAt: '2026-09-20T00:00:00.000Z',
      updatedAt: '2026-09-20T00:00:00.000Z',
    },
  ]

  it('não deve renderizar quando isOpen for false', () => {
    render(
      <CreateTicketModal
        isOpen={false}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        categories={mockCategories}
      />,
    )

    expect(screen.queryByTestId('create-ticket-modal')).not.toBeInTheDocument()
  })

  it('deve renderizar o modal e campos quando isOpen for true', () => {
    render(
      <CreateTicketModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        categories={mockCategories}
      />,
    )

    expect(screen.getByTestId('create-ticket-modal')).toBeInTheDocument()
    expect(screen.getByText('Abrir Novo Chamado')).toBeInTheDocument()
    expect(screen.getByLabelText('Título do Chamado')).toBeInTheDocument()
    expect(screen.getByLabelText('Categoria')).toBeInTheDocument()
    expect(screen.getByLabelText('Prioridade')).toBeInTheDocument()
    expect(screen.getByLabelText('Descrição Detalhada')).toBeInTheDocument()
  })

  it('deve exibir erros de validação se os campos obrigatórios estiverem vazios', async () => {
    render(
      <CreateTicketModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        categories={mockCategories}
      />,
    )

    const submitButton = screen.getByRole('button', { name: /abrir chamado/i })
    fireEvent.click(submitButton)

    expect(await screen.findByText('O título deve ter pelo menos 3 caracteres')).toBeInTheDocument()
    expect(screen.getByText('A descrição deve ter pelo menos 5 caracteres')).toBeInTheDocument()
    expect(screen.getByText('Selecione uma categoria para o chamado')).toBeInTheDocument()
  })

  it('deve submeter o formulário com sucesso quando todos os dados forem válidos', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const onClose = vi.fn()

    render(
      <CreateTicketModal
        isOpen={true}
        onClose={onClose}
        onSubmit={onSubmit}
        categories={mockCategories}
      />,
    )

    fireEvent.change(screen.getByLabelText('Título do Chamado'), {
      target: { value: 'Impressora sem papel' },
    })
    fireEvent.change(screen.getByLabelText('Categoria'), {
      target: { value: 'cat-1' },
    })
    fireEvent.change(screen.getByLabelText('Descrição Detalhada'), {
      target: { value: 'A impressora do RH está sem folhas' },
    })

    const submitButton = screen.getByRole('button', { name: /abrir chamado/i })
    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        title: 'Impressora sem papel',
        description: 'A impressora do RH está sem folhas',
        priority: 'MEDIUM',
        categoryId: 'cat-1',
      })
      expect(onClose).toHaveBeenCalled()
    })
  })

  it('deve exibir mensagem de erro caso o onSubmit lance uma exceção', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Categoria inativa'))

    render(
      <CreateTicketModal
        isOpen={true}
        onClose={vi.fn()}
        onSubmit={onSubmit}
        categories={mockCategories}
      />,
    )

    fireEvent.change(screen.getByLabelText('Título do Chamado'), {
      target: { value: 'Impressora sem papel' },
    })
    fireEvent.change(screen.getByLabelText('Categoria'), {
      target: { value: 'cat-1' },
    })
    fireEvent.change(screen.getByLabelText('Descrição Detalhada'), {
      target: { value: 'A impressora do RH está sem folhas' },
    })

    const submitButton = screen.getByRole('button', { name: /abrir chamado/i })
    fireEvent.click(submitButton)

    expect(await screen.findByText('Categoria inativa')).toBeInTheDocument()
  })
})
