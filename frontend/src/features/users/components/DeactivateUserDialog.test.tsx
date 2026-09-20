import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DeactivateUserDialog } from './DeactivateUserDialog'
import type { SafeUser } from '../types/users.types'

describe('DeactivateUserDialog', () => {
  const mockUser: SafeUser = {
    id: 'user-to-deactivate',
    name: 'Carlos Santos',
    email: 'carlos@exemplo.com',
    role: 'TECHNICIAN',
    active: true,
    createdAt: '2026-09-20T00:00:00.000Z',
    updatedAt: '2026-09-20T00:00:00.000Z',
  }

  const defaultProps = {
    isOpen: true,
    user: mockUser,
    onClose: vi.fn(),
    onConfirm: vi.fn().mockResolvedValue(undefined),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('não deve renderizar quando isOpen for false ou user for null', () => {
    const { rerender } = render(
      <DeactivateUserDialog {...defaultProps} isOpen={false} />
    )
    expect(
      screen.queryByTestId('deactivate-user-dialog')
    ).not.toBeInTheDocument()

    rerender(<DeactivateUserDialog {...defaultProps} user={null} />)
    expect(
      screen.queryByTestId('deactivate-user-dialog')
    ).not.toBeInTheDocument()
  })

  it('deve exibir o nome e e-mail do usuário no alerta de confirmação', () => {
    render(<DeactivateUserDialog {...defaultProps} />)

    expect(screen.getByText('Desativar Usuário')).toBeInTheDocument()
    expect(screen.getByText('Carlos Santos')).toBeInTheDocument()
    expect(screen.getByText('carlos@exemplo.com')).toBeInTheDocument()
  })

  it('deve chamar onClose ao clicar em Cancelar', () => {
    render(<DeactivateUserDialog {...defaultProps} />)

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(defaultProps.onClose).toHaveBeenCalled()
    expect(defaultProps.onConfirm).not.toHaveBeenCalled()
  })

  it('deve chamar onConfirm com o ID do usuário ao confirmar a ação', async () => {
    render(<DeactivateUserDialog {...defaultProps} />)

    fireEvent.click(screen.getByRole('button', { name: 'Sim, Desativar' }))

    await waitFor(() => {
      expect(defaultProps.onConfirm).toHaveBeenCalledWith('user-to-deactivate')
      expect(defaultProps.onClose).toHaveBeenCalled()
    })
  })

  it('deve exibir mensagem de erro quando onConfirm falhar', async () => {
    const failedConfirm = vi
      .fn()
      .mockRejectedValue(new Error('Erro no servidor ao desativar'))

    render(<DeactivateUserDialog {...defaultProps} onConfirm={failedConfirm} />)

    fireEvent.click(screen.getByRole('button', { name: 'Sim, Desativar' }))

    expect(
      await screen.findByText('Erro no servidor ao desativar')
    ).toBeInTheDocument()
    expect(defaultProps.onClose).not.toHaveBeenCalled()
  })
})
