import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EditCategoryModal } from './EditCategoryModal'
import type { Category } from '../types/categories.types'

describe('EditCategoryModal', () => {
  const mockCategory: Category = {
    id: 'cat-1',
    name: 'Hardware',
    description: 'Problemas físicos',
    active: true,
    createdAt: '2026-09-20T00:00:00.000Z',
    updatedAt: '2026-09-20T00:00:00.000Z',
  }

  const defaultProps = {
    isOpen: true,
    category: mockCategory,
    onClose: vi.fn(),
    onSubmit: vi.fn().mockResolvedValue(undefined),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('não deve renderizar nada quando isOpen for false ou category for null', () => {
    const { rerender } = render(<EditCategoryModal {...defaultProps} isOpen={false} />)
    expect(screen.queryByTestId('edit-category-modal')).not.toBeInTheDocument()

    rerender(<EditCategoryModal {...defaultProps} category={null} />)
    expect(screen.queryByTestId('edit-category-modal')).not.toBeInTheDocument()
  })

  it('deve preencher os campos do formulário com os dados da categoria fornecida', () => {
    render(<EditCategoryModal {...defaultProps} />)

    expect(screen.getByText('Editar Categoria')).toBeInTheDocument()
    expect(screen.getByLabelText(/nome da categoria/i)).toHaveValue('Hardware')
    expect(screen.getByLabelText(/descrição/i)).toHaveValue('Problemas físicos')
    expect(screen.getByLabelText(/status/i)).toHaveValue('true')
  })

  it('deve exibir erro de validação se o nome for limpo e submetido vazio', async () => {
    render(<EditCategoryModal {...defaultProps} />)

    fireEvent.change(screen.getByLabelText(/nome da categoria/i), {
      target: { value: '' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar Alterações' }))

    expect(await screen.findByText('Nome da categoria é obrigatório')).toBeInTheDocument()
    expect(defaultProps.onSubmit).not.toHaveBeenCalled()
  })

  it('deve submeter o formulário com dados atualizados e fechar o modal', async () => {
    render(<EditCategoryModal {...defaultProps} />)

    fireEvent.change(screen.getByLabelText(/nome da categoria/i), {
      target: { value: 'Hardware & Periféricos' },
    })
    fireEvent.change(screen.getByLabelText(/status/i), {
      target: { value: 'false' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Salvar Alterações' }))

    await waitFor(() => {
      expect(defaultProps.onSubmit).toHaveBeenCalledWith('cat-1', {
        name: 'Hardware & Periféricos',
        description: 'Problemas físicos',
        active: false,
      })
      expect(defaultProps.onClose).toHaveBeenCalled()
    })
  })

  it('deve exibir mensagem de erro quando a API rejeitar a atualização', async () => {
    const failedSubmit = vi
      .fn()
      .mockRejectedValue(new Error('Nome de categoria em uso por outro registro'))

    render(<EditCategoryModal {...defaultProps} onSubmit={failedSubmit} />)

    fireEvent.click(screen.getByRole('button', { name: 'Salvar Alterações' }))

    expect(
      await screen.findByText('Nome de categoria em uso por outro registro')
    ).toBeInTheDocument()
    expect(defaultProps.onClose).not.toHaveBeenCalled()
  })
})
