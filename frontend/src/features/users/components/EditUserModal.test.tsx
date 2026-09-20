import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EditUserModal } from './EditUserModal'
import type { SafeUser } from '../types/users.types'

describe('EditUserModal', () => {
  const mockUser: SafeUser = {
    id: 'user-1',
    name: 'João da Silva',
    email: 'joao@exemplo.com',
    role: 'USER',
    active: true,
    createdAt: '2026-09-20T00:00:00.000Z',
    updatedAt: '2026-09-20T00:00:00.000Z',
  }

  const defaultProps = {
    isOpen: true,
    user: mockUser,
    onClose: vi.fn(),
    onSubmit: vi.fn().mockResolvedValue(undefined),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('não deve renderizar nada quando isOpen for false ou user for null', () => {
    const { rerender } = render(<EditUserModal {...defaultProps} isOpen={false} />)
    expect(screen.queryByTestId('edit-user-modal')).not.toBeInTheDocument()

    rerender(<EditUserModal {...defaultProps} user={null} />)
    expect(screen.queryByTestId('edit-user-modal')).not.toBeInTheDocument()
  })

  it('deve preencher o formulário com as informações do usuário e desabilitar o e-mail', () => {
    render(<EditUserModal {...defaultProps} />)

    expect(screen.getByText('Editar Usuário')).toBeInTheDocument()

    const emailInput = screen.getByLabelText(/e-mail/i) as HTMLInputElement
    expect(emailInput.value).toBe('joao@exemplo.com')
    expect(emailInput).toBeDisabled()

    const nameInput = screen.getByLabelText(/nome completo/i) as HTMLInputElement
    expect(nameInput.value).toBe('João da Silva')

    const roleSelect = screen.getByLabelText(/papel/i) as HTMLSelectElement
    expect(roleSelect.value).toBe('USER')
  })

  it('deve exibir erro se o nome for limpo e submetido vazio', async () => {
    render(<EditUserModal {...defaultProps} />)

    fireEvent.change(screen.getByLabelText(/nome completo/i), {
      target: { value: '' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Salvar Alterações' }))

    expect(await screen.findByText('Nome é obrigatório')).toBeInTheDocument()
    expect(defaultProps.onSubmit).not.toHaveBeenCalled()
  })

  it('deve submeter a atualização com novos dados válidos', async () => {
    render(<EditUserModal {...defaultProps} />)

    fireEvent.change(screen.getByLabelText(/nome completo/i), {
      target: { value: 'João da Silva Editado' },
    })
    fireEvent.change(screen.getByLabelText(/papel/i), {
      target: { value: 'TECHNICIAN' },
    })

    fireEvent.click(screen.getByRole('button', { name: 'Salvar Alterações' }))

    await waitFor(() => {
      expect(defaultProps.onSubmit).toHaveBeenCalledWith('user-1', {
        name: 'João da Silva Editado',
        role: 'TECHNICIAN',
      })
      expect(defaultProps.onClose).toHaveBeenCalled()
    })
  })
})
