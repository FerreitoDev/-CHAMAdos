import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { TicketAuditItem } from './TicketAuditItem';
import { AUDIT_ACTIONS, type AuditItem } from '../types/audit.types';

describe('TicketAuditItem', () => {
  const baseActor = {
    id: 'user-admin',
    name: 'Admin Santos',
    email: 'admin@test.com',
    role: 'ADMIN' as const,
    active: true,
    createdAt: '2026-09-20T00:00:00.000Z',
    updatedAt: '2026-09-20T00:00:00.000Z',
  };

  it('deve renderizar o evento de criação de chamado corretamente', () => {
    const audit: AuditItem = {
      id: 'audit-1',
      action: AUDIT_ACTIONS.TICKET_CREATED,
      data: { title: 'Sem acesso à VPN' },
      ticketId: 'ticket-1',
      actorId: 'user-admin',
      createdAt: '2026-09-20T10:00:00.000Z',
      actor: baseActor,
    };

    render(<TicketAuditItem audit={audit} />);

    expect(screen.getByText('Chamado Criado')).toBeInTheDocument();
    expect(screen.getByText(/chamado aberto e registrado no sistema/i)).toBeInTheDocument();
    expect(screen.getByText('Admin Santos')).toBeInTheDocument();
    expect(screen.getByText('Administrador')).toBeInTheDocument();
  });

  it('deve renderizar o evento de atribuição de técnico', () => {
    const audit: AuditItem = {
      id: 'audit-2',
      action: AUDIT_ACTIONS.TICKET_ASSIGNED,
      data: { assigneeId: 'tech-1' },
      ticketId: 'ticket-1',
      actorId: 'user-admin',
      createdAt: '2026-09-20T11:00:00.000Z',
      actor: { ...baseActor, name: 'Técnico Silva', role: 'TECHNICIAN' },
    };

    render(<TicketAuditItem audit={audit} />);

    expect(screen.getByText('Chamado Atribuído')).toBeInTheDocument();
    expect(screen.getByText(/técnico responsável definido para o atendimento/i)).toBeInTheDocument();
    expect(screen.getByText('Técnico Silva')).toBeInTheDocument();
    expect(screen.getByText('Técnico')).toBeInTheDocument();
  });

  it('deve renderizar o evento de reatribuição de técnico', () => {
    const audit: AuditItem = {
      id: 'audit-3',
      action: AUDIT_ACTIONS.TICKET_REASSIGNED,
      data: { assigneeId: 'tech-2' },
      ticketId: 'ticket-1',
      actorId: 'user-admin',
      createdAt: '2026-09-20T11:30:00.000Z',
      actor: baseActor,
    };

    render(<TicketAuditItem audit={audit} />);

    expect(screen.getByText('Chamado Reatribuído')).toBeInTheDocument();
    expect(screen.getByText(/atendimento transferido para outro técnico responsável/i)).toBeInTheDocument();
  });

  it('deve renderizar o evento de chamado resolvido', () => {
    const audit: AuditItem = {
      id: 'audit-4',
      action: AUDIT_ACTIONS.TICKET_RESOLVED,
      data: { status: 'RESOLVED' },
      ticketId: 'ticket-1',
      actorId: 'tech-1',
      createdAt: '2026-09-20T12:00:00.000Z',
      actor: { ...baseActor, name: 'Técnico Silva', role: 'TECHNICIAN' },
    };

    render(<TicketAuditItem audit={audit} />);

    expect(screen.getByText('Chamado Resolvido')).toBeInTheDocument();
    expect(screen.getByText(/solução aplicada e chamado marcado como resolvido/i)).toBeInTheDocument();
  });

  it('deve renderizar o evento de chamado encerrado', () => {
    const audit: AuditItem = {
      id: 'audit-5',
      action: AUDIT_ACTIONS.TICKET_CLOSED,
      data: { status: 'CLOSED' },
      ticketId: 'ticket-1',
      actorId: 'user-admin',
      createdAt: '2026-09-20T14:00:00.000Z',
      actor: baseActor,
    };

    render(<TicketAuditItem audit={audit} />);

    expect(screen.getByText('Chamado Encerrado')).toBeInTheDocument();
    expect(screen.getByText(/chamado concluído e encerrado definitivamente/i)).toBeInTheDocument();
  });

  it('deve renderizar o evento de chamado reaberto', () => {
    const audit: AuditItem = {
      id: 'audit-6',
      action: AUDIT_ACTIONS.TICKET_REOPENED,
      data: { status: 'IN_PROGRESS' },
      ticketId: 'ticket-1',
      actorId: 'user-admin',
      createdAt: '2026-09-20T15:00:00.000Z',
      actor: baseActor,
    };

    render(<TicketAuditItem audit={audit} />);

    expect(screen.getByText('Chamado Reaberto')).toBeInTheDocument();
    expect(screen.getByText(/chamado reaberto para continuidade do atendimento/i)).toBeInTheDocument();
  });

  it('deve exibir mensagem de sistema quando não houver ator registrado', () => {
    const audit: AuditItem = {
      id: 'audit-7',
      action: 'SYSTEM_CLEANUP',
      data: null,
      ticketId: 'ticket-1',
      actorId: null,
      createdAt: '2026-09-20T16:00:00.000Z',
      actor: null,
    };

    render(<TicketAuditItem audit={audit} isLast={true} />);

    expect(screen.getByText('Ação Operacional')).toBeInTheDocument();
    expect(screen.getByText(/ação automatizada pelo sistema/i)).toBeInTheDocument();
  });
});
