import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { UserTable } from './UserTable'
import type { SafeUser } from '../types/users.types'

describe('UserTable', () => {
  const mockUsers: SafeUser[] = [
    {
      id: 'admin-1',
      name: 'Admin Teste',
      email: 'admin@exemplo.com',
      role: 'ADMIN',
      active: true,
      createdAt: '2026-09-20T00:00:00.000Z',
      updatedAt: '2026-09-20T00:00:00.000Z',
    },
    {
      id: 'user-2',
      name: 'Usuario Comum',
      email: 'user@exemplo.com',
      role: 'USER',
      active: true,
      createdAt: '2026-09-20T00:00:00.000Z',
      updatedAt: '2026-09-20T00:00:00.000Z',
    },
    {
      id: 'inactive-3',
      name: 'Usuario Inativo',
      email: 'inativo@exemplo.com',
      role: 'TECHNICIAN',
      active: false,
      createdAt: '2026-09-20T00:00:00.000Z',
      updatedAt: '2026-09-20T00:00:00.000Z',
    },
  ]

  it('deve renderizar a mensagem de carregamento quando isLoading for true', () => {
    render(<UserTable users={[]} isLoading={true} />)
    expect(screen.getByText(/carregando lista de usuários/i)).toBeInTheDocument()
  })

  it('deve renderizar mensagem de lista vazia quando não houver usuários', () => {
    render(<UserTable users={[]} />)
    expect(screen.getByText(/nenhum usuário encontrado/i)).toBeInTheDocument()
  })

  it('deve renderizar a lista de usuários com seus nomes, papéis e status', () => {
    render(<UserTable users={mockUsers} />)

    expect(screen.getByText('Admin Teste')).toBeInTheDocument()
    expect(screen.getByText('Usuario Comum')).toBeInTheDocument()
    expect(screen.getByText('Usuario Inativo')).toBeInTheDocument()

    expect(screen.getByText('Administrador')).toBeInTheDocument()
    expect(screen.getAllByText('Usuário').length).toBeGreaterThan(0)
    expect(screen.getByText('Técnico')).toBeInTheDocument()

    expect(screen.getAllByText('Ativo')).toHaveLength(2)
    expect(screen.getByText('Inativo')).toBeInTheDocument()
  })

  it('deve disparar onEdit ao clicar no botão de editar', () => {
    const handleEdit = vi.fn()
    render(<UserTable users={mockUsers} onEdit={handleEdit} />)

    const editBtn = screen.getByRole('button', { name: 'Editar Admin Teste' })
    fireEvent.click(editBtn)

    expect(handleEdit).toHaveBeenCalledWith(mockUsers[0])
  })

  it('deve disparar onDeactivate ao clicar no botão de desativar para outro usuário ativo', () => {
    const handleDeactivate = vi.fn()
    render(
      <UserTable
        users={mockUsers}
        currentUserId="admin-1"
        onDeactivate={handleDeactivate}
      />
    )

    const deactivateBtn = screen.getByRole('button', {
      name: 'Desativar Usuario Comum',
    })
    expect(deactivateBtn).not.toBeDisabled()
    fireEvent.click(deactivateBtn)

    expect(handleDeactivate).toHaveBeenCalledWith(mockUsers[1])
  })

  it('deve desabilitar o botão de desativar para o próprio usuário logado (auto-desativação)', () => {
    render(<UserTable users={mockUsers} currentUserId="admin-1" />)

    const selfDeactivateBtn = screen.getByRole('button', {
      name: 'Desativar Admin Teste',
    })
    expect(selfDeactivateBtn).toBeDisabled()
    expect(selfDeactivateBtn).toHaveAttribute(
      'title',
      'Você não pode desativar sua própria conta'
    )
  })

  it('deve desabilitar o botão de desativar para um usuário que já está inativo', () => {
    render(<UserTable users={mockUsers} currentUserId="admin-1" />)

    const inactiveBtn = screen.getByRole('button', {
      name: 'Desativar Usuario Inativo',
    })
    expect(inactiveBtn).toBeDisabled()
    expect(inactiveBtn).toHaveAttribute('title', 'Usuário já está inativo')
  })
})
