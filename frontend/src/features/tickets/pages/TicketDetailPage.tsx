import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ticketsApi } from '../api/tickets.api'
import type { Ticket } from '../types/tickets.types'
import { TicketStatusBadge } from '../components/TicketStatusBadge'
import { TicketPriorityBadge } from '../components/TicketPriorityBadge'
import { TicketActionsBar } from '../components/TicketActionsBar'
import { TicketCommentsSection } from '../components/TicketCommentsSection'
import { TicketAuditSection } from '../components/TicketAuditSection'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Calendar, Tag, Ticket as TicketIcon, User, UserCheck } from 'lucide-react'

export const TicketDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return

    const fetchTicket = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await ticketsApi.getTicketById(id)
        setTicket(data)
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('Erro ao carregar detalhes do chamado.')
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchTicket()
  }, [id])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Não registrado'
    try {
      return new Date(dateString).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateString
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl text-center text-muted-foreground animate-pulse">
        Carregando detalhes do chamado...
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl text-center space-y-4">
        <div className="p-4 rounded-lg bg-destructive/15 border border-destructive/30 text-destructive text-sm">
          {error || 'Chamado não encontrado ou você não tem permissão para acessá-lo.'}
        </div>
        <Button variant="outline" onClick={() => navigate('/tickets')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Lista de Chamados
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-6">
      {/* Header com Ação de Voltar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/tickets')}
          className="w-fit text-muted-foreground hover:text-foreground -ml-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Chamados
        </Button>

        <div className="flex items-center gap-2.5">
          <TicketPriorityBadge priority={ticket.priority} />
          <TicketStatusBadge status={ticket.status} />
        </div>
      </div>

      {/* Título e Identificador */}
      <div className="space-y-1.5">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">
          Chamado #{ticket.id}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <TicketIcon className="w-5 h-5" />
          </div>
          <span className="truncate">{ticket.title}</span>
        </h1>
      </div>

      {/* Grid Corporativo 70% / 30% */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Coluna Principal (70%): Descrição, Comentários e Auditoria */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card Descrição do Problema */}
          <Card className="rounded-xl border border-border bg-card shadow-xs">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-base font-semibold text-foreground">
                Descrição do Problema
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {ticket.description}
            </CardContent>
          </Card>

          {/* Seção de Comentários */}
          <TicketCommentsSection
            ticketId={ticket.id}
            isClosed={ticket.status === 'CLOSED'}
          />

          {/* Seção de Linha do Tempo de Auditoria (ADMIN / Técnico Responsável) */}
          <TicketAuditSection
            ticketId={ticket.id}
            assigneeId={ticket.assigneeId}
          />
        </div>

        {/* Coluna Lateral (30%): Ações e Metadados Corporativos */}
        <div className="lg:col-span-1 space-y-6">
          {/* Barra de Ações de Atendimento */}
          <TicketActionsBar
            ticket={ticket}
            onTicketUpdated={(updated) => setTicket(updated)}
          />

          {/* Card Solicitante */}
          <Card className="rounded-xl border border-border bg-card shadow-xs">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-xs uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Solicitante
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-1">
              <div className="font-medium text-foreground text-sm">{ticket.requester.name}</div>
              <div className="text-xs text-muted-foreground">{ticket.requester.email}</div>
            </CardContent>
          </Card>

          {/* Card Técnico Responsável */}
          <Card className="rounded-xl border border-border bg-card shadow-xs">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-xs uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-primary" />
                Técnico Responsável
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-1">
              {ticket.assignee ? (
                <>
                  <div className="font-medium text-foreground text-sm">{ticket.assignee.name}</div>
                  <div className="text-xs text-muted-foreground">{ticket.assignee.email}</div>
                </>
              ) : (
                <div className="text-xs italic text-muted-foreground">
                  Sem técnico responsável atribuído no momento
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card Categoria */}
          <Card className="rounded-xl border border-border bg-card shadow-xs">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-xs uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-2">
                <Tag className="w-4 h-4 text-primary" />
                Categoria
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-1">
              <div className="font-medium text-foreground text-sm">{ticket.category.name}</div>
              {ticket.category.description && (
                <div className="text-xs text-muted-foreground">{ticket.category.description}</div>
              )}
            </CardContent>
          </Card>

          {/* Card Histórico de Datas */}
          <Card className="rounded-xl border border-border bg-card shadow-xs">
            <CardHeader className="pb-3 border-b border-border">
              <CardTitle className="text-xs uppercase font-semibold text-muted-foreground tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Histórico de Datas
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-2.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Aberto em: </span>
                <span className="font-medium text-foreground">{formatDate(ticket.createdAt)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Resolvido em: </span>
                <span className="font-medium text-foreground">{formatDate(ticket.resolvedAt)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Encerrado em: </span>
                <span className="font-medium text-foreground">{formatDate(ticket.closedAt)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
