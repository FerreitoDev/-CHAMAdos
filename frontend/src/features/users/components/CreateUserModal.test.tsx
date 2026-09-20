import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CreateUserModal } from './CreateUserModal'

describe('CreateUserModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSubmit: vi.fn().mockResolvedValue(undefined),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('não deve renderizar nada quando isOpen for false', () => {
    render(<CreateUserModal {...defaultProps} isOpen={false} />)
    expect(screen.queryByTestId('create-user-modal')).not.toBeInTheDocument()
  })

  it('deve renderizar o formulário completo quando isOpen for true', () => {
    render(<CreateUserModal {...defaultProps} />)

    expect(screen.getByText('Cadastrar Novo Usuário')).toBeInTheDocument()
    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/senha inicial/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/papel/i)).toBeInTheDocument()
  })

  it('deve exibir erros de validação quando campos obrigatórios estiverem vazios', async () => {
    render(<CreateUserModal {...defaultProps} />)

    fireEvent.click(screen.getByRole('button', { name: 'Cadastrar Usuário' }))

    expect(await screen.findByText('Nome é obrigatório')).toBeInTheDocument()
    expect(await screen.findByText('E-mail é obrigatório')).toBeInTheDocument()
    expect(await screen.findByText('Senha é obrigatória')).toBeInTheDocument()
    expect(defaultProps.onSubmit).not.toHaveBeenCalled()
  })

  it('deve exibir erro de validação para senha com menos de 8 caracteres', async () => {
    render(<CreateUserModal {...defaultProps} />)

    fireEvent.change(screen.getByLabelText(/nome completo/i), {
      target: { value: 'Fulano Teste' },
    })
    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: 'fulano@exemplo.com' },
    })
    fireEvent.change(screen.getByLabelText(/senha inicial/i), {
      target: { value: '123' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Cadastrar Usuário' }))

    expect(
      await screen.findByText('A senha deve ter no mínimo 8 caracteres')
    ).toBeInTheDocument()
    expect(defaultProps.onSubmit).not.toHaveBeenCalled()
  })

  it('deve submeter o formulário com dados válidos e fechar o modal', async () => {
    render(<CreateUserModal {...defaultProps} />)

    fireEvent.change(screen.getByLabelText(/nome completo/i), {
      target: { value: 'Fulano Teste' },
    })
    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: 'fulano@exemplo.com' },
    })
    fireEvent.change(screen.getByLabelText(/senha inicial/i), {
      target: { value: 'password123' },
    })
    fireEvent.change(screen.getByLabelText(/papel/i), {
      target: { value: 'ADMIN' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Cadastrar Usuário' }))

    await waitFor(() => {
      expect(defaultProps.onSubmit).toHaveBeenCalledWith({
        name: 'Fulano Teste',
        email: 'fulano@exemplo.com',
        password: 'password123',
        role: 'ADMIN',
      })
      expect(defaultProps.onClose).toHaveBeenCalled()
    })
  })

  it('deve exibir mensagem de erro quando a API rejeitar a submissão', async () => {
    const failedSubmit = vi
      .fn()
      .mockRejectedValue(new Error('E-mail já cadastrado no sistema'))

    render(<CreateUserModal {...defaultProps} onSubmit={failedSubmit} />)

    fireEvent.change(screen.getByLabelText(/nome completo/i), {
      target: { value: 'Fulano Teste' },
    })
    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: 'fulano@exemplo.com' },
    })
    fireEvent.change(screen.getByLabelText(/senha inicial/i), {
      target: { value: 'password123' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Cadastrar Usuário' }))

    expect(
      await screen.findByText('E-mail já cadastrado no sistema')
    ).toBeInTheDocument()
    expect(defaultProps.onClose).not.toHaveBeenCalled()
  })
})
