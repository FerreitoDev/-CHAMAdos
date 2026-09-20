import React, { useEffect, useState } from 'react'
import { ticketsApi } from '../api/tickets.api'
import type { Ticket } from '../types/tickets.types'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react'

interface ResolveTicketModalProps {
  isOpen: boolean
  onClose: () => void
  ticketId: string
  ticketTitle?: string
  onSuccess: (updatedTicket: Ticket) => void
}

export const ResolveTicketModal: React.FC<ResolveTicketModalProps> = ({
  isOpen,
  onClose,
  ticketId,
  ticketTitle,
  onSuccess,
}) => {
  const [solutionNotes, setSolutionNotes] = useState('')
  const [apiError, setApiError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setSolutionNotes('')
      setApiError(null)
      setIsSubmitting(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)
      setApiError(null)
      const updated = await ticketsApi.resolveTicket(ticketId, {
        solutionNotes: solutionNotes.trim() || undefined,
      })
      onSuccess(updated)
      onClose()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setApiError(err.message)
      } else {
        setApiError('Erro ao resolver chamado. Tente novamente.')
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
      <div className="bg-card text-card-foreground border border-border rounded-xl shadow-2xl w-full max-w-lg p-6 relative animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-500">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Resolver Chamado</h2>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="solution-notes">Notas da Solução (Opcional)</Label>
            <textarea
              id="solution-notes"
              rows={4}
              placeholder="Descreva a solução técnica aplicada ou observações relevantes..."
              value={solutionNotes}
              onChange={(e) => setSolutionNotes(e.target.value)}
              disabled={isSubmitting}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring text-foreground resize-none"
            />
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
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Resolvendo...
                </>
              ) : (
                'Confirmar Resolução'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
