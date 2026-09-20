import { describe, it, expect, vi, beforeEach } from 'vitest'
import { categoriesApi } from './categories.api'
import { apiClient } from '@/shared/api/client'
import type { Category } from '../types/categories.types'

vi.mock('@/shared/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('categoriesApi', () => {
  const mockCategory: Category = {
    id: 'cat-1',
    name: 'Hardware',
    description: 'Problemas com equipamentos físicos',
    active: true,
    createdAt: '2026-09-20T00:00:00.000Z',
    updatedAt: '2026-09-20T00:00:00.000Z',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getCategories deve chamar GET /categories sem params por padrão', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: [mockCategory] })

    const result = await categoriesApi.getCategories()

    expect(apiClient.get).toHaveBeenCalledWith('/categories', { params: undefined })
    expect(result).toEqual([mockCategory])
  })

  it('getCategories deve chamar GET /categories com includeInactive = true quando informado', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: [mockCategory] })

    const result = await categoriesApi.getCategories({ includeInactive: true })

    expect(apiClient.get).toHaveBeenCalledWith('/categories', {
      params: { includeInactive: true },
    })
    expect(result).toEqual([mockCategory])
  })

  it('getCategoryById deve chamar GET /categories/:id e retornar a categoria', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockCategory })

    const result = await categoriesApi.getCategoryById('cat-1')

    expect(apiClient.get).toHaveBeenCalledWith('/categories/cat-1')
    expect(result).toEqual(mockCategory)
  })

  it('createCategory deve chamar POST /categories com o payload e retornar a nova categoria', async () => {
    const payload = {
      name: 'Hardware',
      description: 'Problemas com equipamentos físicos',
    }
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockCategory })

    const result = await categoriesApi.createCategory(payload)

    expect(apiClient.post).toHaveBeenCalledWith('/categories', payload)
    expect(result).toEqual(mockCategory)
  })

  it('updateCategory deve chamar PATCH /categories/:id com o payload e retornar a categoria atualizada', async () => {
    const payload = { name: 'Hardware & Equipamentos' }
    const updatedCategory = { ...mockCategory, name: 'Hardware & Equipamentos' }
    vi.mocked(apiClient.patch).mockResolvedValueOnce({ data: updatedCategory })

    const result = await categoriesApi.updateCategory('cat-1', payload)

    expect(apiClient.patch).toHaveBeenCalledWith('/categories/cat-1', payload)
    expect(result).toEqual(updatedCategory)
  })

  it('deactivateCategory deve chamar DELETE /categories/:id', async () => {
    vi.mocked(apiClient.delete).mockResolvedValueOnce({ data: null })

    await categoriesApi.deactivateCategory('cat-1')

    expect(apiClient.delete).toHaveBeenCalledWith('/categories/cat-1')
  })
})
