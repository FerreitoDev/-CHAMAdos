import React, { useState, useEffect } from 'react'
import type { SafeUser, UpdateUserPayload, UserRole } from '../types/users.types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { X, Edit2, AlertCircle, Loader2 } from 'lucide-react'

interface EditUserModalProps {
  isOpen: boolean
  user: SafeUser | null
  onClose: () => void
  onSubmit: (id: string, payload: UpdateUserPayload) => Promise<void>
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  user,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('')
  const [role, setRole] = useState<UserRole>('USER')

  const [error, setError] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen && user) {
      setName(user.name)
      setRole(user.role)
      setError(null)
      setApiError(null)
      setIsSubmitting(false)
    }
  }, [isOpen, user])

  if (!isOpen || !user) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError(null)

    if (!name.trim()) {
      setError('Nome é obrigatório')
      return
    }
    setError(null)

    try {
      setIsSubmitting(true)
      await onSubmit(user.id, {
        name: name.trim(),
        role,
      })
      onClose()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setApiError(err.message)
      } else {
        setApiError('Erro ao atualizar usuário. Tente novamente.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      data-testid="edit-user-modal"
    >
      <div className="relative w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-6 text-foreground overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Edit2 className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold tracking-tight">
              Editar Usuário
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md"
            aria-label="Fechar"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* API Error Alert */}
        {apiError && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/15 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="edit-email">E-mail (Bloqueado)</Label>
            <Input
              id="edit-email"
              type="email"
              value={user.email}
              disabled
              className="bg-muted text-muted-foreground cursor-not-allowed"
            />
            <p className="text-[11px] text-muted-foreground">
              O e-mail não pode ser alterado por aqui.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-name">Nome Completo</Label>
            <Input
              id="edit-name"
              placeholder="Ex: João da Silva"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
            />
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="edit-role">Papel / Nível de Acesso</Label>
            <select
              id="edit-role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              disabled={isSubmitting}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
            >
              <option value="USER">Usuário (Solicitante)</option>
              <option value="TECHNICIAN">Técnico (Atendimento)</option>
              <option value="ADMIN">Administrador (Gestão)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
