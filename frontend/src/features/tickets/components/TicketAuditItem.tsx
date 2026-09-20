import React from 'react';
import type { AuditItem } from '../types/audit.types';
import { AUDIT_ACTIONS } from '../types/audit.types';
import { UserRoleBadge } from '@/features/users/components/UserRoleBadge';
import {
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  Lock,
  PlusCircle,
  RotateCcw,
  UserCheck,
} from 'lucide-react';

interface TicketAuditItemProps {
  audit: AuditItem;
  isLast?: boolean;
}

interface ActionMeta {
  title: string;
  description: string;
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
}

const actionMetaMap: Record<string, ActionMeta> = {
  [AUDIT_ACTIONS.TICKET_CREATED]: {
    title: 'Chamado Criado',
    description: 'Chamado aberto e registrado no sistema.',
    icon: PlusCircle,
    iconColor: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10 border-emerald-500/20',
  },
  [AUDIT_ACTIONS.TICKET_ASSIGNED]: {
    title: 'Chamado Atribuído',
    description: 'Técnico responsável definido para o atendimento.',
    icon: UserCheck,
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-500/10 border-blue-500/20',
  },
  [AUDIT_ACTIONS.TICKET_REASSIGNED]: {
    title: 'Chamado Reatribuído',
    description: 'Atendimento transferido para outro técnico responsável.',
    icon: ArrowRightLeft,
    iconColor: 'text-indigo-500',
    bgColor: 'bg-indigo-500/10 border-indigo-500/20',
  },
  [AUDIT_ACTIONS.TICKET_RESOLVED]: {
    title: 'Chamado Resolvido',
    description: 'Solução aplicada e chamado marcado como resolvido.',
    icon: CheckCircle2,
    iconColor: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10 border-emerald-500/20',
  },
  [AUDIT_ACTIONS.TICKET_CLOSED]: {
    title: 'Chamado Encerrado',
    description: 'Chamado concluído e encerrado definitivamente.',
    icon: Lock,
    iconColor: 'text-zinc-400',
    bgColor: 'bg-zinc-500/10 border-zinc-500/20',
  },
  [AUDIT_ACTIONS.TICKET_REOPENED]: {
    title: 'Chamado Reaberto',
    description: 'Chamado reaberto para continuidade do atendimento.',
    icon: RotateCcw,
    iconColor: 'text-amber-500',
    bgColor: 'bg-amber-500/10 border-amber-500/20',
  },
};

const defaultActionMeta: ActionMeta = {
  title: 'Ação Operacional',
  description: 'Evento registrado no histórico do chamado.',
  icon: Clock,
  iconColor: 'text-muted-foreground',
  bgColor: 'bg-muted border-border',
};

export const TicketAuditItem: React.FC<TicketAuditItemProps> = ({ audit, isLast = false }) => {
  const meta = actionMetaMap[audit.action] || defaultActionMeta;
  const Icon = meta.icon;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="relative flex gap-4 text-sm" data-testid={`audit-item-${audit.id}`}>
      {/* Linha vertical conectora */}
      {!isLast && (
        <span
          className="absolute left-4 top-8 -bottom-4 w-px bg-border/80"
          aria-hidden="true"
        />
      )}

      {/* Ícone com borda circular */}
      <div
        className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${meta.bgColor}`}
      >
        <Icon className={`h-4 w-4 ${meta.iconColor}`} />
      </div>

      {/* Conteúdo do Evento */}
      <div className="flex-1 pb-6 space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground text-sm">{meta.title}</span>
            {audit.actor && <UserRoleBadge role={audit.actor.role} />}
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            {formatDate(audit.createdAt)}
          </span>
        </div>

        <p className="text-xs text-muted-foreground">{meta.description}</p>

        {/* Identificação do Ator */}
        <div className="text-xs text-muted-foreground pt-0.5">
          {audit.actor ? (
            <span>
              Realizado por <strong className="text-foreground font-medium">{audit.actor.name}</strong>
            </span>
          ) : (
            <span className="italic">Ação automatizada pelo sistema</span>
          )}
        </div>
      </div>
    </div>
  );
};
