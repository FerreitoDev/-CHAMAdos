import React, { useState, useEffect } from 'react'
import type { SafeUser } from '../types/users.types'
import { Button } from '@/components/ui/button'
import { X, AlertTriangle, Loader2 } from 'lucide-react'

interface DeactivateUserDialogProps {
  isOpen: boolean
  user: SafeUser | null
  onClose: () => void
  onConfirm: (id: string) => Promise<void>
}

export const DeactivateUserDialog: React.FC<DeactivateUserDialogProps> = ({
  isOpen,
  user,
  onClose,
  onConfirm,
}) => {
  const [apiError, setApiError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setApiError(null)
      setIsSubmitting(false)
    }
  }, [isOpen])

  if (!isOpen || !user) return null

  const handleConfirm = async () => {
    setApiError(null)
    try {
      setIsSubmitting(true)
      await onConfirm(user.id)
      onClose()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setApiError(err.message)
      } else {
        setApiError('Erro ao desativar usuário. Tente novamente.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
      data-testid="deactivate-user-dialog"
    >
      <div className="relative w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-6 text-foreground overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
          <div className="flex items-center gap-2 text-destructive">
            <div className="p-2 rounded-lg bg-destructive/10">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Desativar Usuário
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md"
            aria-label="Fechar"
            type="button"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* API Error Alert */}
        {apiError && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/15 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Content */}
        <div className="space-y-3 mb-6">
          <p className="text-sm text-muted-foreground">
            Tem certeza que deseja desativar a conta de{' '}
            <strong className="text-foreground font-semibold">
              {user.name}
            </strong>{' '}
            (<span className="font-mono text-xs">{user.email}</span>)?
          </p>
          <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs">
            ⚠️ Esta ação impedirá que o usuário faça login no sistema. O histórico
            e os chamados vinculados serão preservados.
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Desativando...
              </>
            ) : (
              'Sim, Desativar'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
