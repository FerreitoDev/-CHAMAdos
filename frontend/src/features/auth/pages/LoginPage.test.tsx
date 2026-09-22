import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAuth } from '../use-auth'
import { LoginPage } from './LoginPage'

const mockNavigate = vi.fn()
const mockLocation = { state: { from: { pathname: '/tickets' } } }

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
  }
})

vi.mock('../use-auth', () => ({
  useAuth: vi.fn(),
}))

describe('LoginPage', () => {
  const mockLogin = vi.fn()

  const setupAuth = (isAuthenticated = false) => {
    vi.mocked(useAuth).mockReturnValue({
      user: isAuthenticated
        ? { id: 'usr-1', email: 'teste@empresa.com', role: 'USER' }
        : null,
      accessToken: isAuthenticated ? 'fake-token' : null,
      isAuthenticated,
      isLoading: false,
      login: mockLogin,
      logout: vi.fn(),
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve renderizar a marca CHAMAdos, campos de login e botão de submissão', () => {
    setupAuth(false)

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: /CHAMAdos/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^entrar$/i })).toBeInTheDocument()
  })

  it('deve submeter o formulário com email e senha e navegar para a rota de origem', async () => {
    setupAuth(false)
    mockLogin.mockResolvedValueOnce(undefined)

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    const emailInput = screen.getByLabelText(/e-mail/i)
    const passwordInput = screen.getByLabelText(/senha/i)
    const submitButton = screen.getByRole('button', { name: /^entrar$/i })

    fireEvent.change(emailInput, { target: { value: 'usuario@empresa.com' } })
    fireEvent.change(passwordInput, { target: { value: 'senha123' } })

    fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'usuario@empresa.com',
        password: 'senha123',
      })
      expect(mockNavigate).toHaveBeenCalledWith('/tickets', { replace: true })
    })
  })

  it('deve exibir mensagem de erro estruturada quando as credenciais forem inválidas', async () => {
    setupAuth(false)
    mockLogin.mockRejectedValueOnce(new Error('Unauthorized'))

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    const emailInput = screen.getByLabelText(/e-mail/i)
    const passwordInput = screen.getByLabelText(/senha/i)
    const submitButton = screen.getByRole('button', { name: /^entrar$/i })

    fireEvent.change(emailInput, { target: { value: 'invalido@empresa.com' } })
    fireEvent.change(passwordInput, { target: { value: 'errada' } })

    fireEvent.click(submitButton)

    await waitFor(() => {
      const alert = screen.getByRole('alert')
      expect(alert).toBeInTheDocument()
      expect(alert).toHaveTextContent(/credenciais inválidas/i)
    })
  })

  it('deve redirecionar para a rota de destino se o usuário já estiver autenticado', () => {
    setupAuth(true)

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    expect(mockNavigate).toHaveBeenCalledWith('/tickets', { replace: true })
  })

  it('deve exibir indicador de carregamento e desabilitar inputs durante a submissão', async () => {
    setupAuth(false)
    // Promessa pendente para simular requisição em andamento
    let resolveLogin!: () => void
    mockLogin.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        resolveLogin = resolve
      }),
    )

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )

    const emailInput = screen.getByLabelText(/e-mail/i)
    const passwordInput = screen.getByLabelText(/senha/i)
    const submitButton = screen.getByRole('button', { name: /^entrar$/i })

    fireEvent.change(emailInput, { target: { value: 'usuario@empresa.com' } })
    fireEvent.change(passwordInput, { target: { value: 'senha123' } })

    fireEvent.click(submitButton)

    expect(screen.getByRole('button', { name: /entrando\.\.\./i })).toBeDisabled()
    expect(emailInput).toBeDisabled()
    expect(passwordInput).toBeDisabled()

    await act(async () => {
      resolveLogin()
    })
  })
})
