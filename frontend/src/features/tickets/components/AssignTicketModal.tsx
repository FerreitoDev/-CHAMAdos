import React, { useEffect, useState } from 'react'
import { ticketsApi } from '../api/tickets.api'
import { usersApi } from '@/features/users/api/users.api'
import type { Ticket } from '../types/tickets.types'
import type { SafeUser } from '@/features/users/types/users.types'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { AlertCircle, Loader2, UserCheck, X } from 'lucide-react'

interface AssignTicketModalProps {
  isOpen: boolean
  onClose: () => void
  ticketId: string
  ticketTitle?: string
  currentAssigneeId?: string | null
  onSuccess: (updatedTicket: Ticket) => void
  technicians?: SafeUser[]
}

export const AssignTicketModal: React.FC<AssignTicketModalProps> = ({
  isOpen,
  onClose,
  ticketId,
  ticketTitle,
  currentAssigneeId,
  onSuccess,
  technicians: techniciansProp,
}) => {
  const [selectedTechId, setSelectedTechId] = useState('')
  const [technicians, setTechnicians] = useState<SafeUser[]>(techniciansProp || [])
  const [isLoadingTechs, setIsLoadingTechs] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isReassign = Boolean(currentAssigneeId)

  useEffect(() => {
    if (isOpen) {
      setSelectedTechId(currentAssigneeId || '')
      setValidationError(null)
      setApiError(null)
      setIsSubmitting(false)

      if (!techniciansProp) {
        setIsLoadingTechs(true)
        usersApi
          .getUsers()
          .then((users) => {
            const availableTechs = users.filter(
              (u) => u.active && (u.role === 'TECHNICIAN' || u.role === 'ADMIN'),
            )
            setTechnicians(availableTechs)
          })
          .catch(() => {
            setApiError('Não foi possível carregar a lista de técnicos.')
          })
          .finally(() => {
            setIsLoadingTechs(false)
          })
      } else {
        setTechnicians(techniciansProp.filter((u) => u.active))
      }
    }
  }, [isOpen, currentAssigneeId, techniciansProp])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedTechId) {
      setValidationError('Selecione um técnico responsável.')
      return
    }

    try {
      setIsSubmitting(true)
      setValidationError(null)
      setApiError(null)

      let updated: Ticket
      if (isReassign) {
        updated = await ticketsApi.reassignTicket(ticketId, { assigneeId: selectedTechId })
      } else {
        updated = await ticketsApi.assignTicket(ticketId, { assigneeId: selectedTechId })
      }

      onSuccess(updated)
      onClose()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setApiError(err.message)
      } else {
        setApiError('Erro ao atribuir chamado. Tente novamente.')
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
            <div className="p-2 rounded-lg bg-primary/15 text-primary">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight">
                {isReassign ? 'Reatribuir Chamado' : 'Atribuir Chamado'}
              </h2>
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
            <Label htmlFor="assignee-select">Técnico Responsável</Label>
            <select
              id="assignee-select"
              value={selectedTechId}
              onChange={(e) => {
                setSelectedTechId(e.target.value)
                setValidationError(null)
              }}
              disabled={isSubmitting || isLoadingTechs}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring text-foreground"
            >
              <option value="">
                {isLoadingTechs ? 'Carregando técnicos...' : 'Selecione um técnico...'}
              </option>
              {technicians.map((tech) => (
                <option key={tech.id} value={tech.id}>
                  {tech.name} ({tech.email}) — {tech.role === 'ADMIN' ? 'Admin' : 'Técnico'}
                </option>
              ))}
            </select>
            {validationError && (
              <p className="text-xs text-destructive">{validationError}</p>
            )}
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
            <Button type="submit" disabled={isSubmitting || isLoadingTechs}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : isReassign ? (
                'Reatribuir'
              ) : (
                'Atribuir'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
