import { describe, it, expect, vi, beforeEach } from 'vitest'
import { usersApi } from './users.api'
import { apiClient } from '@/shared/api/client'
import type { SafeUser } from '../types/users.types'

vi.mock('@/shared/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('usersApi', () => {
  const mockUser: SafeUser = {
    id: 'user-1',
    name: 'Fulano Teste',
    email: 'fulano@exemplo.com',
    role: 'USER',
    active: true,
    createdAt: '2026-09-20T00:00:00.000Z',
    updatedAt: '2026-09-20T00:00:00.000Z',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getUsers deve chamar GET /users e retornar a lista de usuários', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: [mockUser] })

    const result = await usersApi.getUsers()

    expect(apiClient.get).toHaveBeenCalledWith('/users')
    expect(result).toEqual([mockUser])
  })

  it('getUserById deve chamar GET /users/:id e retornar o usuário', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockUser })

    const result = await usersApi.getUserById('user-1')

    expect(apiClient.get).toHaveBeenCalledWith('/users/user-1')
    expect(result).toEqual(mockUser)
  })

  it('createUser deve chamar POST /users com o payload e retornar o novo usuário', async () => {
    const payload = {
      name: 'Fulano Teste',
      email: 'fulano@exemplo.com',
      password: 'password123',
      role: 'USER' as const,
    }
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockUser })

    const result = await usersApi.createUser(payload)

    expect(apiClient.post).toHaveBeenCalledWith('/users', payload)
    expect(result).toEqual(mockUser)
  })

  it('updateUser deve chamar PATCH /users/:id com o payload e retornar o usuário atualizado', async () => {
    const payload = { name: 'Fulano Atualizado' }
    const updatedUser = { ...mockUser, name: 'Fulano Atualizado' }
    vi.mocked(apiClient.patch).mockResolvedValueOnce({ data: updatedUser })

    const result = await usersApi.updateUser('user-1', payload)

    expect(apiClient.patch).toHaveBeenCalledWith('/users/user-1', payload)
    expect(result).toEqual(updatedUser)
  })

  it('deactivateUser deve chamar DELETE /users/:id', async () => {
    vi.mocked(apiClient.delete).mockResolvedValueOnce({ data: null })

    await usersApi.deactivateUser('user-1')

    expect(apiClient.delete).toHaveBeenCalledWith('/users/user-1')
  })
})
