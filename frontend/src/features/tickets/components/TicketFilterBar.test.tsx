import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import type { Category } from '@/features/categories/types/categories.types'
import { TicketFilterBar } from './TicketFilterBar'

vi.mock('@/features/categories/api/categories.api', () => ({
  categoriesApi: {
    getCategories: vi.fn().mockResolvedValue([]),
  },
}))

describe('TicketFilterBar', () => {
  const mockCategories: Category[] = [
    {
      id: 'cat-1',
      name: 'Hardware',
      description: null,
      active: true,
      createdAt: '2026-09-20T00:00:00.000Z',
      updatedAt: '2026-09-20T00:00:00.000Z',
    },
    {
      id: 'cat-2',
      name: 'Software',
      description: null,
      active: true,
      createdAt: '2026-09-20T00:00:00.000Z',
      updatedAt: '2026-09-20T00:00:00.000Z',
    },
  ]

  it('deve renderizar o campo de busca e os selects de filtro', () => {
    render(
      <TicketFilterBar
        categories={mockCategories}
        onFilterChange={vi.fn()}
        onClearFilters={vi.fn()}
      />,
    )

    expect(screen.getByPlaceholderText('Buscar por título ou descrição...')).toBeInTheDocument()
    expect(screen.getByLabelText('Filtrar por Status')).toBeInTheDocument()
    expect(screen.getByLabelText('Filtrar por Prioridade')).toBeInTheDocument()
    expect(screen.getByLabelText('Filtrar por Categoria')).toBeInTheDocument()
    expect(screen.getByText('Hardware')).toBeInTheDocument()
    expect(screen.getByText('Software')).toBeInTheDocument()
  })

  it('deve disparar onFilterChange ao digitar no campo de busca', () => {
    const onFilterChange = vi.fn()
    render(
      <TicketFilterBar
        categories={mockCategories}
        onFilterChange={onFilterChange}
        onClearFilters={vi.fn()}
      />,
    )

    const searchInput = screen.getByPlaceholderText('Buscar por título ou descrição...')
    fireEvent.change(searchInput, { target: { value: 'impressora' } })

    expect(onFilterChange).toHaveBeenCalledWith({
      search: 'impressora',
      status: undefined,
      priority: undefined,
      categoryId: undefined,
    })
  })

  it('deve disparar onFilterChange ao selecionar um status', () => {
    const onFilterChange = vi.fn()
    render(
      <TicketFilterBar
        categories={mockCategories}
        onFilterChange={onFilterChange}
        onClearFilters={vi.fn()}
      />,
    )

    const statusSelect = screen.getByLabelText('Filtrar por Status')
    fireEvent.change(statusSelect, { target: { value: 'OPEN' } })

    expect(onFilterChange).toHaveBeenCalledWith({
      search: '',
      status: 'OPEN',
      priority: undefined,
      categoryId: undefined,
    })
  })

  it('deve exibir o botão de Limpar Filtros quando houver filtro ativo e disparar onClearFilters', () => {
    const onClearFilters = vi.fn()
    render(
      <TicketFilterBar
        search="computador"
        categories={mockCategories}
        onFilterChange={vi.fn()}
        onClearFilters={onClearFilters}
      />,
    )

    const clearButton = screen.getByRole('button', { name: /limpar filtros/i })
    expect(clearButton).toBeInTheDocument()

    fireEvent.click(clearButton)
    expect(onClearFilters).toHaveBeenCalled()
  })
})
