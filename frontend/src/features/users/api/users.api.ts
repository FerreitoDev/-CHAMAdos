import { apiClient } from '@/shared/api/client'
import type { SafeUser, CreateUserPayload, UpdateUserPayload } from '../types/users.types'

export const usersApi = {
  async getUsers(): Promise<SafeUser[]> {
    const { data } = await apiClient.get<SafeUser[]>('/users')
    return data
  },

  async getUserById(id: string): Promise<SafeUser> {
    const { data } = await apiClient.get<SafeUser>(`/users/${id}`)
    return data
  },

  async createUser(payload: CreateUserPayload): Promise<SafeUser> {
    const { data } = await apiClient.post<SafeUser>('/users', payload)
    return data
  },

  async updateUser(id: string, payload: UpdateUserPayload): Promise<SafeUser> {
    const { data } = await apiClient.patch<SafeUser>(`/users/${id}`, payload)
    return data
  },

  async deactivateUser(id: string): Promise<void> {
    await apiClient.delete(`/users/${id}`)
  },
}
