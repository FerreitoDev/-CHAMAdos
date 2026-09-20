import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UsersPage } from '../pages/UsersPage'
import { usersApi } from '../api/users.api'
import type { SafeUser } from '../types/users.types'

vi.mock('../api/users.api', () => ({
  usersApi: {
    getUsers: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    deactivateUser: vi.fn(),
  },
}))

vi.mock('@/features/auth/use-auth', () => ({
  useAuth: () => ({
    user: { id: 'admin-1', email: 'admin@exemplo.com', role: 'ADMIN' },
    isAuthenticated: true,
    isLoading: false,
  }),
}))

describe('UsersPage', () => {
  const mockUsers: SafeUser[] = [
    {
      id: 'admin-1',
      name: 'Admin Principal',
      email: 'admin@exemplo.com',
      role: 'ADMIN',
      active: true,
      createdAt: '2026-09-20T00:00:00.000Z',
      updatedAt: '2026-09-20T00:00:00.000Z',
    },
    {
      id: 'user-2',
      name: 'Bruno Silva',
      email: 'bruno@exemplo.com',
      role: 'USER',
      active: true,
      createdAt: '2026-09-20T00:00:00.000Z',
      updatedAt: '2026-09-20T00:00:00.000Z',
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve carregar e exibir a lista de usuários ao montar', async () => {
    vi.mocked(usersApi.getUsers).mockResolvedValueOnce(mockUsers)

    render(<UsersPage />)

    expect(screen.getByText('Gerenciamento de Usuários')).toBeInTheDocument()
    expect(await screen.findByText('Admin Principal')).toBeInTheDocument()
    expect(screen.getByText('Bruno Silva')).toBeInTheDocument()
  })

  it('deve filtrar os usuários pelo campo de busca', async () => {
    vi.mocked(usersApi.getUsers).mockResolvedValueOnce(mockUsers)

    render(<UsersPage />)

    await screen.findByText('Admin Principal')

    const searchInput = screen.getByPlaceholderText(
      /buscar por nome ou e-mail/i
    )
    fireEvent.change(searchInput, { target: { value: 'Bruno' } })

    expect(screen.queryByText('Admin Principal')).not.toBeInTheDocument()
    expect(screen.getByText('Bruno Silva')).toBeInTheDocument()
  })

  it('deve abrir o modal de cadastro ao clicar no botão "Novo Usuário"', async () => {
    vi.mocked(usersApi.getUsers).mockResolvedValueOnce(mockUsers)

    render(<UsersPage />)

    await screen.findByText('Admin Principal')

    fireEvent.click(screen.getByRole('button', { name: /novo usuário/i }))

    expect(screen.getByText('Cadastrar Novo Usuário')).toBeInTheDocument()
  })

  it('deve abrir o modal de edição ao clicar no botão de editar da tabela', async () => {
    vi.mocked(usersApi.getUsers).mockResolvedValueOnce(mockUsers)

    render(<UsersPage />)

    await screen.findByText('Admin Principal')

    const editBtn = screen.getByRole('button', { name: 'Editar Bruno Silva' })
    fireEvent.click(editBtn)

    expect(screen.getByText('Editar Usuário')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Bruno Silva')).toBeInTheDocument()
  })

  it('deve abrir o diálogo de confirmação de desativação ao clicar no botão desativar', async () => {
    vi.mocked(usersApi.getUsers).mockResolvedValueOnce(mockUsers)

    render(<UsersPage />)

    await screen.findByText('Admin Principal')

    const deactivateBtn = screen.getByRole('button', {
      name: 'Desativar Bruno Silva',
    })
    fireEvent.click(deactivateBtn)

    expect(screen.getByText('Desativar Usuário')).toBeInTheDocument()
    expect(screen.getAllByText('bruno@exemplo.com').length).toBeGreaterThan(0)
  })
})
