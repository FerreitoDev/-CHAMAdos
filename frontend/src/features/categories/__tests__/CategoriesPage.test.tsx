import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CategoriesPage } from '../pages/CategoriesPage'
import { categoriesApi } from '../api/categories.api'
import type { Category } from '../types/categories.types'

vi.mock('../api/categories.api', () => ({
  categoriesApi: {
    getCategories: vi.fn(),
    createCategory: vi.fn(),
    updateCategory: vi.fn(),
    deactivateCategory: vi.fn(),
  },
}))

describe('CategoriesPage', () => {
  const mockCategories: Category[] = [
    {
      id: 'cat-1',
      name: 'Hardware',
      description: 'Problemas de hardware',
      active: true,
      createdAt: '2026-09-20T00:00:00.000Z',
      updatedAt: '2026-09-20T00:00:00.000Z',
    },
    {
      id: 'cat-2',
      name: 'Rede e Conectividade',
      description: 'Wi-Fi e VPN',
      active: true,
      createdAt: '2026-09-20T00:00:00.000Z',
      updatedAt: '2026-09-20T00:00:00.000Z',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve carregar e exibir a lista de categorias ao montar', async () => {
    vi.mocked(categoriesApi.getCategories).mockResolvedValueOnce(mockCategories)

    render(<CategoriesPage />)

    expect(screen.getByText('Gerenciamento de Categorias')).toBeInTheDocument()
    expect(await screen.findByText('Hardware')).toBeInTheDocument()
    expect(screen.getByText('Rede e Conectividade')).toBeInTheDocument()
  })

  it('deve filtrar as categorias pelo campo de busca', async () => {
    vi.mocked(categoriesApi.getCategories).mockResolvedValueOnce(mockCategories)

    render(<CategoriesPage />)

    await screen.findByText('Hardware')

    const searchInput = screen.getByPlaceholderText(
      /buscar por nome ou descrição/i
    )
    fireEvent.change(searchInput, { target: { value: 'Rede' } })

    expect(screen.queryByText('Hardware')).not.toBeInTheDocument()
    expect(screen.getByText('Rede e Conectividade')).toBeInTheDocument()
  })

  it('deve alternar a exibição de inativas ao clicar no botão de filtro', async () => {
    vi.mocked(categoriesApi.getCategories).mockResolvedValue(mockCategories)

    render(<CategoriesPage />)

    await screen.findByText('Hardware')

    const toggleBtn = screen.getByRole('button', {
      name: /exibindo inativas/i,
    })
    fireEvent.click(toggleBtn)

    await waitFor(() => {
      expect(categoriesApi.getCategories).toHaveBeenLastCalledWith({
        includeInactive: false,
      })
    })
  })

  it('deve abrir o modal de cadastro ao clicar no botão "Nova Categoria"', async () => {
    vi.mocked(categoriesApi.getCategories).mockResolvedValueOnce(mockCategories)

    render(<CategoriesPage />)

    await screen.findByText('Hardware')

    fireEvent.click(screen.getByRole('button', { name: /nova categoria/i }))

    expect(screen.getByText('Cadastrar Nova Categoria')).toBeInTheDocument()
  })

  it('deve abrir o modal de edição ao clicar no botão de editar da tabela', async () => {
    vi.mocked(categoriesApi.getCategories).mockResolvedValueOnce(mockCategories)

    render(<CategoriesPage />)

    await screen.findByText('Hardware')

    const editBtn = screen.getByRole('button', { name: 'Editar Hardware' })
    fireEvent.click(editBtn)

    expect(screen.getByText('Editar Categoria')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Hardware')).toBeInTheDocument()
  })

  it('deve abrir o diálogo de confirmação de desativação ao clicar no botão desativar', async () => {
    vi.mocked(categoriesApi.getCategories).mockResolvedValueOnce(mockCategories)

    render(<CategoriesPage />)

    await screen.findByText('Hardware')

    const deactivateBtn = screen.getByRole('button', {
      name: 'Desativar Hardware',
    })
    fireEvent.click(deactivateBtn)

    expect(screen.getByText('Desativar Categoria')).toBeInTheDocument()
  })
})
