import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CreateCategoryModal } from './CreateCategoryModal'

describe('CreateCategoryModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSubmit: vi.fn().mockResolvedValue(undefined),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('não deve renderizar nada quando isOpen for false', () => {
    render(<CreateCategoryModal {...defaultProps} isOpen={false} />)
    expect(screen.queryByTestId('create-category-modal')).not.toBeInTheDocument()
  })

  it('deve renderizar o formulário completo quando isOpen for true', () => {
    render(<CreateCategoryModal {...defaultProps} />)

    expect(screen.getByText('Cadastrar Nova Categoria')).toBeInTheDocument()
    expect(screen.getByLabelText(/nome da categoria/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument()
  })

  it('deve exibir erro de validação quando o nome estiver vazio', async () => {
    render(<CreateCategoryModal {...defaultProps} />)

    fireEvent.click(screen.getByRole('button', { name: 'Cadastrar Categoria' }))

    expect(await screen.findByText('Nome da categoria é obrigatório')).toBeInTheDocument()
    expect(defaultProps.onSubmit).not.toHaveBeenCalled()
  })

  it('deve submeter o formulário com dados válidos e fechar o modal', async () => {
    render(<CreateCategoryModal {...defaultProps} />)

    fireEvent.change(screen.getByLabelText(/nome da categoria/i), {
      target: { value: 'Hardware' },
    })
    fireEvent.change(screen.getByLabelText(/descrição/i), {
      target: { value: 'Problemas de hardware' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Cadastrar Categoria' }))

    await waitFor(() => {
      expect(defaultProps.onSubmit).toHaveBeenCalledWith({
        name: 'Hardware',
        description: 'Problemas de hardware',
      })
      expect(defaultProps.onClose).toHaveBeenCalled()
    })
  })

  it('deve exibir mensagem de erro quando a API rejeitar a submissão (ex: nome duplicado)', async () => {
    const failedSubmit = vi
      .fn()
      .mockRejectedValue(new Error('Já existe uma categoria com este nome'))

    render(<CreateCategoryModal {...defaultProps} onSubmit={failedSubmit} />)

    fireEvent.change(screen.getByLabelText(/nome da categoria/i), {
      target: { value: 'Hardware' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Cadastrar Categoria' }))

    expect(
      await screen.findByText('Já existe uma categoria com este nome')
    ).toBeInTheDocument()
    expect(defaultProps.onClose).not.toHaveBeenCalled()
  })
})
