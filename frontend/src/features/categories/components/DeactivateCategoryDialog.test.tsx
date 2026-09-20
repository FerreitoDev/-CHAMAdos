import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DeactivateCategoryDialog } from './DeactivateCategoryDialog'
import type { Category } from '../types/categories.types'

describe('DeactivateCategoryDialog', () => {
  const mockCategory: Category = {
    id: 'cat-to-deactivate',
    name: 'Impressoras',
    description: 'Problemas com impressoras e periféricos',
    active: true,
    createdAt: '2026-09-20T00:00:00.000Z',
    updatedAt: '2026-09-20T00:00:00.000Z',
  }

  const defaultProps = {
    isOpen: true,
    category: mockCategory,
    onClose: vi.fn(),
    onConfirm: vi.fn().mockResolvedValue(undefined),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('não deve renderizar quando isOpen for false ou category for null', () => {
    const { rerender } = render(
      <DeactivateCategoryDialog {...defaultProps} isOpen={false} />
    )
    expect(
      screen.queryByTestId('deactivate-category-dialog')
    ).not.toBeInTheDocument()

    rerender(<DeactivateCategoryDialog {...defaultProps} category={null} />)
    expect(
      screen.queryByTestId('deactivate-category-dialog')
    ).not.toBeInTheDocument()
  })

  it('deve exibir o nome da categoria no alerta de confirmação', () => {
    render(<DeactivateCategoryDialog {...defaultProps} />)

    expect(screen.getByText('Desativar Categoria')).toBeInTheDocument()
    expect(screen.getByText('Impressoras')).toBeInTheDocument()
  })

  it('deve chamar onClose ao clicar em Cancelar', () => {
    render(<DeactivateCategoryDialog {...defaultProps} />)

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(defaultProps.onClose).toHaveBeenCalled()
    expect(defaultProps.onConfirm).not.toHaveBeenCalled()
  })

  it('deve chamar onConfirm com o ID da categoria ao confirmar a ação', async () => {
    render(<DeactivateCategoryDialog {...defaultProps} />)

    fireEvent.click(screen.getByRole('button', { name: 'Sim, Desativar' }))

    await waitFor(() => {
      expect(defaultProps.onConfirm).toHaveBeenCalledWith('cat-to-deactivate')
      expect(defaultProps.onClose).toHaveBeenCalled()
    })
  })

  it('deve exibir mensagem de erro quando onConfirm falhar', async () => {
    const failedConfirm = vi
      .fn()
      .mockRejectedValue(new Error('Erro no servidor ao desativar categoria'))

    render(<DeactivateCategoryDialog {...defaultProps} onConfirm={failedConfirm} />)

    fireEvent.click(screen.getByRole('button', { name: 'Sim, Desativar' }))

    expect(
      await screen.findByText('Erro no servidor ao desativar categoria')
    ).toBeInTheDocument()
    expect(defaultProps.onClose).not.toHaveBeenCalled()
  })
})
