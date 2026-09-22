import React, { useState } from 'react'
import { useAuth } from '@/features/auth/use-auth'
import { ticketsApi } from '../api/tickets.api'
import type { Ticket } from '../types/tickets.types'
import { AssignTicketModal } from './AssignTicketModal'
import { ResolveTicketModal } from './ResolveTicketModal'
import { CloseTicketModal } from './CloseTicketModal'
import { ReopenTicketModal } from './ReopenTicketModal'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle2, Loader2, Lock, RotateCcw, UserCheck } from 'lucide-react'

interface TicketActionsBarProps {
  ticket: Ticket
  onTicketUpdated: (updatedTicket: Ticket) => void
}

export const TicketActionsBar: React.FC<TicketActionsBarProps> = ({
  ticket,
  onTicketUpdated,
}) => {
  const { user } = useAuth()

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false)
  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false)
  const [isReopenModalOpen, setIsReopenModalOpen] = useState(false)

  const [isSelfAssigning, setIsSelfAssigning] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  if (!user) return null

  const isTechnician = user.role === 'TECHNICIAN'
  const isAdmin = user.role === 'ADMIN'
  const isRequester = ticket.requesterId === user.id
  const isAssignee = ticket.assigneeId === user.id

  // 1. Assumir chamado (Técnico autoatribuição em chamado aberto sem responsável)
  const canSelfAssign = isTechnician && ticket.status === 'OPEN' && !ticket.assigneeId

  // 2. Atribuir ou reatribuir técnico (ADMIN em chamado aberto ou em atendimento)
  const canAssignOrReassign = isAdmin && (ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS')

  // 3. Resolver chamado (Técnico responsável ou ADMIN em chamado em atendimento)
  const canResolve = ticket.status === 'IN_PROGRESS' && (isAdmin || isAssignee)

  // 4. Encerrar chamado (ADMIN em chamado resolvido)
  const canClose = isAdmin && ticket.status === 'RESOLVED'

  // 5. Reabrir chamado (Solicitante ou ADMIN em chamado resolvido ou encerrado)
  const canReopen = (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') && (isAdmin || isRequester)

  const hasAnyAction = canSelfAssign || canAssignOrReassign || canResolve || canClose || canReopen

  if (!hasAnyAction) return null

  const handleSelfAssign = async () => {
    try {
      setIsSelfAssigning(true)
      setActionError(null)
      const updated = await ticketsApi.assignTicket(ticket.id)
      onTicketUpdated(updated)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setActionError(err.message)
      } else {
        setActionError('Erro ao assumir chamado. Tente novamente.')
      }
    } finally {
      setIsSelfAssigning(false)
    }
  }

  return (
    <>
      <div className="bg-card text-card-foreground border border-border rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Ações de Atendimento</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ações disponíveis para o seu perfil ({user.role}) no estado atual ({ticket.status}).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Botão Assumir Chamado */}
            {canSelfAssign && (
              <Button
                variant="default"
                size="sm"
                onClick={handleSelfAssign}
                disabled={isSelfAssigning}
                className="shadow-xs"
              >
                {isSelfAssigning ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Assumindo...
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 mr-2" />
                    Assumir Chamado
                  </>
                )}
              </Button>
            )}

            {/* Botão Atribuir / Reatribuir */}
            {canAssignOrReassign && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAssignModalOpen(true)}
                className="shadow-xs"
              >
                <UserCheck className="w-4 h-4 mr-2" />
                {ticket.assigneeId ? 'Reatribuir Técnico' : 'Atribuir Técnico'}
              </Button>
            )}

            {/* Botão Resolver Chamado */}
            {canResolve && (
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsResolveModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Resolver Chamado
              </Button>
            )}

            {/* Botão Encerrar Chamado */}
            {canClose && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setIsCloseModalOpen(true)}
                className="shadow-xs"
              >
                <Lock className="w-4 h-4 mr-2" />
                Encerrar Chamado
              </Button>
            )}

            {/* Botão Reabrir Chamado */}
            {canReopen && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsReopenModalOpen(true)}
                className="border-amber-300 text-amber-900 bg-amber-50 hover:bg-amber-100 hover:text-amber-950 shadow-xs"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reabrir Chamado
              </Button>
            )}
          </div>
        </div>

        {/* Action Error */}
        {actionError && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}
      </div>

      {/* Modais de Ação */}
      {isAssignModalOpen && (
        <AssignTicketModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          ticketId={ticket.id}
          ticketTitle={ticket.title}
          currentAssigneeId={ticket.assigneeId}
          onSuccess={onTicketUpdated}
        />
      )}

      {isResolveModalOpen && (
        <ResolveTicketModal
          isOpen={isResolveModalOpen}
          onClose={() => setIsResolveModalOpen(false)}
          ticketId={ticket.id}
          ticketTitle={ticket.title}
          onSuccess={onTicketUpdated}
        />
      )}

      {isCloseModalOpen && (
        <CloseTicketModal
          isOpen={isCloseModalOpen}
          onClose={() => setIsCloseModalOpen(false)}
          ticketId={ticket.id}
          ticketTitle={ticket.title}
          onSuccess={onTicketUpdated}
        />
      )}

      {isReopenModalOpen && (
        <ReopenTicketModal
          isOpen={isReopenModalOpen}
          onClose={() => setIsReopenModalOpen(false)}
          ticketId={ticket.id}
          ticketTitle={ticket.title}
          onSuccess={onTicketUpdated}
        />
      )}
    </>
  )
}
