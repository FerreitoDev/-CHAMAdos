import React, { useEffect, useState } from 'react'
import { ticketsApi } from '../api/tickets.api'
import type { Ticket } from '../types/tickets.types'
import { Button } from '@/components/ui/button'
import { AlertCircle, AlertTriangle, Loader2, X } from 'lucide-react'

interface CloseTicketModalProps {
  isOpen: boolean
  onClose: () => void
  ticketId: string
  ticketTitle?: string
  onSuccess: (updatedTicket: Ticket) => void
}

export const CloseTicketModal: React.FC<CloseTicketModalProps> = ({
  isOpen,
  onClose,
  ticketId,
  ticketTitle,
  onSuccess,
}) => {
  const [apiError, setApiError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setApiError(null)
      setIsSubmitting(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleClose = async () => {
    try {
      setIsSubmitting(true)
      setApiError(null)
      const updated = await ticketsApi.closeTicket(ticketId)
      onSuccess(updated)
      onClose()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setApiError(err.message)
      } else {
        setApiError('Erro ao encerrar chamado. Tente novamente.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-card text-card-foreground border border-border rounded-xl shadow-2xl w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-red-500/15 text-red-500">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Encerrar Chamado</h2>
              {ticketTitle && (
                <p className="text-xs text-muted-foreground line-clamp-1">{ticketTitle}</p>
              )}
            </div>
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

        {/* Warning Text */}
        <div className="space-y-2 text-sm text-foreground mb-6">
          <p>
            Tem certeza de que deseja <strong>encerrar definitivamente</strong> este chamado?
          </p>
          <p className="text-xs text-muted-foreground">
            O status será alterado para <strong>ENCERRADO</strong> e a data de encerramento será registrada.
          </p>
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
            onClick={handleClose}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Encerrando...
              </>
            ) : (
              'Confirmar Encerramento'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
