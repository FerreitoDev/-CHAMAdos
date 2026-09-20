import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { CategoryTable } from './CategoryTable'
import type { Category } from '../types/categories.types'

describe('CategoryTable', () => {
  const mockCategories: Category[] = [
    {
      id: 'cat-1',
      name: 'Hardware',
      description: 'Problemas físicos em computadores',
      active: true,
      createdAt: '2026-09-20T00:00:00.000Z',
      updatedAt: '2026-09-20T00:00:00.000Z',
    },
    {
      id: 'cat-2',
      name: 'Software Antigo',
      description: null,
      active: false,
      createdAt: '2026-09-20T00:00:00.000Z',
      updatedAt: '2026-09-20T00:00:00.000Z',
    },
  ]

  it('deve exibir mensagem de carregamento quando isLoading for true', () => {
    render(<CategoryTable categories={[]} isLoading={true} />)

    expect(screen.getByText(/Carregando lista de categorias.../i)).toBeInTheDocument()
  })

  it('deve exibir estado vazio quando a lista de categorias for vazia', () => {
    render(<CategoryTable categories={[]} isLoading={false} />)

    expect(screen.getByText(/Nenhuma categoria encontrada./i)).toBeInTheDocument()
  })

  it('deve renderizar a lista de categorias com os badges corretos', () => {
    render(<CategoryTable categories={mockCategories} />)

    expect(screen.getByText('Hardware')).toBeInTheDocument()
    expect(screen.getByText('Software Antigo')).toBeInTheDocument()
    expect(screen.getByText('Problemas físicos em computadores')).toBeInTheDocument()
    expect(screen.getByText('Sem descrição')).toBeInTheDocument()
    expect(screen.getByText('Ativa')).toBeInTheDocument()
    expect(screen.getByText('Inativa')).toBeInTheDocument()
  })

  it('deve disparar onEdit ao clicar no botão de editar', () => {
    const handleEdit = vi.fn()
    render(<CategoryTable categories={mockCategories} onEdit={handleEdit} />)

    const editBtn = screen.getByRole('button', { name: /Editar Hardware/i })
    fireEvent.click(editBtn)

    expect(handleEdit).toHaveBeenCalledTimes(1)
    expect(handleEdit).toHaveBeenCalledWith(mockCategories[0])
  })

  it('deve disparar onDeactivate ao clicar no botão de desativar para categoria ativa', () => {
    const handleDeactivate = vi.fn()
    render(<CategoryTable categories={mockCategories} onDeactivate={handleDeactivate} />)

    const deactivateBtn = screen.getByRole('button', { name: /Desativar Hardware/i })
    expect(deactivateBtn).not.toBeDisabled()

    fireEvent.click(deactivateBtn)

    expect(handleDeactivate).toHaveBeenCalledTimes(1)
    expect(handleDeactivate).toHaveBeenCalledWith(mockCategories[0])
  })

  it('deve desabilitar o botão de desativar se a categoria já estiver inativa', () => {
    const handleDeactivate = vi.fn()
    render(<CategoryTable categories={mockCategories} onDeactivate={handleDeactivate} />)

    const deactivateBtn = screen.getByRole('button', { name: /Desativar Software Antigo/i })
    expect(deactivateBtn).toBeDisabled()

    fireEvent.click(deactivateBtn)
    expect(handleDeactivate).not.toHaveBeenCalled()
  })
})
