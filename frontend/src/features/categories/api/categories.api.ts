import { apiClient } from '@/shared/api/client'
import type {
  Category,
  CreateCategoryPayload,
  UpdateCategoryPayload,
  GetCategoriesParams,
} from '../types/categories.types'

export const categoriesApi = {
  async getCategories(params?: GetCategoriesParams): Promise<Category[]> {
    const { data } = await apiClient.get<Category[]>('/categories', { params })
    return data
  },

  async getCategoryById(id: string): Promise<Category> {
    const { data } = await apiClient.get<Category>(`/categories/${id}`)
    return data
  },

  async createCategory(payload: CreateCategoryPayload): Promise<Category> {
    const { data } = await apiClient.post<Category>('/categories', payload)
    return data
  },

  async updateCategory(id: string, payload: UpdateCategoryPayload): Promise<Category> {
    const { data } = await apiClient.patch<Category>(`/categories/${id}`, payload)
    return data
  },

  async deactivateCategory(id: string): Promise<void> {
    await apiClient.delete(`/categories/${id}`)
  },
}
