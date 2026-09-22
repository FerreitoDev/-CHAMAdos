import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAuth } from '@/features/auth/use-auth'
import type { AuthContextValue, AuthUser } from '@/features/auth/auth.types'
import { AppHeader } from './AppHeader'

vi.mock('@/features/auth/use-auth', () => ({
  useAuth: vi.fn(),
}))

describe('AppHeader', () => {
  const mockLogout = vi.fn()

  const setupAuth = (user: AuthUser | null) => {
    vi.mocked(useAuth).mockReturnValue({
      user,
      accessToken: user ? 'fake-token' : null,
      isAuthenticated: Boolean(user),
      isLoading: false,
      login: vi.fn(),
      logout: mockLogout,
    } as unknown as AuthContextValue)
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve renderizar a marca CHAMAdos e o link de acesso aos chamados', () => {
    setupAuth({
      id: 'usr-1',
      email: 'analista@empresa.com',
      role: 'USER',
    })

    render(
      <MemoryRouter>
        <AppHeader />
      </MemoryRouter>,
    )

    const logoLink = screen.getByRole('link', { name: /chamados - página inicial/i })
    expect(logoLink).toBeInTheDocument()
    expect(logoLink).toHaveAttribute('href', '/tickets')

    const nav = screen.getByRole('navigation', { name: /navegação principal/i })
    const chamadosLink = screen.getByRole('link', { name: 'Chamados' })
    expect(chamadosLink).toBeInTheDocument()
    expect(chamadosLink).toHaveAttribute('href', '/tickets')
    expect(nav).toContainElement(chamadosLink)
  })

  it('deve exibir os links administrativos de Categorias e Usuários apenas para papel ADMIN', () => {
    setupAuth({
      id: 'admin-1',
      email: 'admin@empresa.com',
      role: 'ADMIN',
    })

    render(
      <MemoryRouter>
        <AppHeader />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: /categorias/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /usuários/i })).toBeInTheDocument()
  })

  it('não deve exibir os links administrativos de Categorias e Usuários para usuários com papel USER ou TECHNICIAN', () => {
    setupAuth({
      id: 'tech-1',
      email: 'tecnico@empresa.com',
      role: 'TECHNICIAN',
    })

    const { rerender } = render(
      <MemoryRouter>
        <AppHeader />
      </MemoryRouter>,
    )

    expect(screen.queryByRole('link', { name: /categorias/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /usuários/i })).not.toBeInTheDocument()

    setupAuth({
      id: 'user-1',
      email: 'usuario@empresa.com',
      role: 'USER',
    })

    rerender(
      <MemoryRouter>
        <AppHeader />
      </MemoryRouter>,
    )

    expect(screen.queryByRole('link', { name: /categorias/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /usuários/i })).not.toBeInTheDocument()
  })

  it('deve exibir o e-mail do usuário e o badge correspondente ao perfil', () => {
    setupAuth({
      id: 'admin-1',
      email: 'admin@empresa.com',
      role: 'ADMIN',
    })

    const { rerender } = render(
      <MemoryRouter>
        <AppHeader />
      </MemoryRouter>,
    )

    expect(screen.getByText('admin@empresa.com')).toBeInTheDocument()
    expect(screen.getAllByText('Administrador')[0]).toBeInTheDocument()

    setupAuth({
      id: 'tech-1',
      email: 'tecnico@empresa.com',
      role: 'TECHNICIAN',
    })

    rerender(
      <MemoryRouter>
        <AppHeader />
      </MemoryRouter>,
    )

    expect(screen.getByText('tecnico@empresa.com')).toBeInTheDocument()
    expect(screen.getAllByText('Técnico')[0]).toBeInTheDocument()

    setupAuth({
      id: 'user-1',
      email: 'usuario@empresa.com',
      role: 'USER',
    })

    rerender(
      <MemoryRouter>
        <AppHeader />
      </MemoryRouter>,
    )

    expect(screen.getByText('usuario@empresa.com')).toBeInTheDocument()
    expect(screen.getAllByText('Usuário')[0]).toBeInTheDocument()
  })

  it('deve disparar o método logout ao clicar no botão de sair', () => {
    setupAuth({
      id: 'usr-1',
      email: 'usuario@empresa.com',
      role: 'USER',
    })

    render(
      <MemoryRouter>
        <AppHeader />
      </MemoryRouter>,
    )

    const logoutButton = screen.getByRole('button', { name: /sair/i })
    fireEvent.click(logoutButton)

    expect(mockLogout).toHaveBeenCalledTimes(1)
  })
})
