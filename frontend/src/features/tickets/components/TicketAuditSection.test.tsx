import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuth } from '@/features/auth/use-auth';
import type { AuthContextValue } from '@/features/auth/auth.types';
import { auditApi } from '../api/audit.api';
import { TicketAuditSection } from './TicketAuditSection';
import { AUDIT_ACTIONS, type AuditItem } from '../types/audit.types';

vi.mock('@/features/auth/use-auth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../api/audit.api', () => ({
  auditApi: {
    getTicketAudit: vi.fn(),
  },
}));

describe('TicketAuditSection', () => {
  const mockAuditLogs: AuditItem[] = [
    {
      id: 'audit-1',
      action: AUDIT_ACTIONS.TICKET_CREATED,
      data: { title: 'Chamado Teste' },
      ticketId: 'ticket-1',
      actorId: 'user-1',
      createdAt: '2026-09-20T10:00:00.000Z',
      actor: {
        id: 'user-1',
        name: 'Solicitante Silva',
        email: 'solicitante@test.com',
        role: 'USER',
        active: true,
        createdAt: '2026-09-20T00:00:00.000Z',
        updatedAt: '2026-09-20T00:00:00.000Z',
      },
    },
    {
      id: 'audit-2',
      action: AUDIT_ACTIONS.TICKET_ASSIGNED,
      data: { assigneeId: 'tech-1' },
      ticketId: 'ticket-1',
      actorId: 'tech-1',
      createdAt: '2026-09-20T11:00:00.000Z',
      actor: {
        id: 'tech-1',
        name: 'Técnico Souza',
        email: 'tecnico@test.com',
        role: 'TECHNICIAN',
        active: true,
        createdAt: '2026-09-20T00:00:00.000Z',
        updatedAt: '2026-09-20T00:00:00.000Z',
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve buscar e exibir a linha do tempo de auditoria quando o usuário for ADMIN', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 'admin-1',
        name: 'Administrador',
        email: 'admin@test.com',
        role: 'ADMIN',
        active: true,
        createdAt: '2026-09-20T00:00:00.000Z',
        updatedAt: '2026-09-20T00:00:00.000Z',
      },
      accessToken: 'token',
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    } as AuthContextValue);

    vi.mocked(auditApi.getTicketAudit).mockResolvedValueOnce(mockAuditLogs);

    render(<TicketAuditSection ticketId="ticket-1" assigneeId="tech-1" />);

    expect(auditApi.getTicketAudit).toHaveBeenCalledWith('ticket-1');

    await waitFor(() => {
      expect(screen.getByText('Histórico de Auditoria')).toBeInTheDocument();
      expect(screen.getByText('Chamado Criado')).toBeInTheDocument();
      expect(screen.getByText('Chamado Atribuído')).toBeInTheDocument();
      expect(screen.getByText('Solicitante Silva')).toBeInTheDocument();
      expect(screen.getByText('Técnico Souza')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  it('deve buscar e exibir a linha do tempo de auditoria quando o técnico for o responsável atribuído', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 'tech-1',
        name: 'Técnico Souza',
        email: 'tecnico@test.com',
        role: 'TECHNICIAN',
        active: true,
        createdAt: '2026-09-20T00:00:00.000Z',
        updatedAt: '2026-09-20T00:00:00.000Z',
      },
      accessToken: 'token',
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    } as AuthContextValue);

    vi.mocked(auditApi.getTicketAudit).mockResolvedValueOnce(mockAuditLogs);

    render(<TicketAuditSection ticketId="ticket-1" assigneeId="tech-1" />);

    expect(auditApi.getTicketAudit).toHaveBeenCalledWith('ticket-1');

    await waitFor(() => {
      expect(screen.getByText('Histórico de Auditoria')).toBeInTheDocument();
      expect(screen.getByText('Chamado Criado')).toBeInTheDocument();
    });
  });

  it('não deve renderizar e não deve chamar a API quando o usuário for um USER comum', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 'user-1',
        name: 'Usuário Comum',
        email: 'user@test.com',
        role: 'USER',
        active: true,
        createdAt: '2026-09-20T00:00:00.000Z',
        updatedAt: '2026-09-20T00:00:00.000Z',
      },
      accessToken: 'token',
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    } as AuthContextValue);

    const { container } = render(
      <TicketAuditSection ticketId="ticket-1" assigneeId="tech-1" />,
    );

    expect(auditApi.getTicketAudit).not.toHaveBeenCalled();
    expect(container.firstChild).toBeNull();
  });

  it('não deve renderizar quando o técnico logado NÃO for o responsável atribuído', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 'tech-2',
        name: 'Outro Técnico',
        email: 'outro@test.com',
        role: 'TECHNICIAN',
        active: true,
        createdAt: '2026-09-20T00:00:00.000Z',
        updatedAt: '2026-09-20T00:00:00.000Z',
      },
      accessToken: 'token',
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    } as AuthContextValue);

    const { container } = render(
      <TicketAuditSection ticketId="ticket-1" assigneeId="tech-1" />,
    );

    expect(auditApi.getTicketAudit).not.toHaveBeenCalled();
    expect(container.firstChild).toBeNull();
  });

  it('deve exibir mensagem de estado vazio quando não houver registros de auditoria', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 'admin-1',
        name: 'Administrador',
        email: 'admin@test.com',
        role: 'ADMIN',
        active: true,
        createdAt: '2026-09-20T00:00:00.000Z',
        updatedAt: '2026-09-20T00:00:00.000Z',
      },
      accessToken: 'token',
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    } as AuthContextValue);

    vi.mocked(auditApi.getTicketAudit).mockResolvedValueOnce([]);

    render(<TicketAuditSection ticketId="ticket-1" assigneeId="tech-1" />);

    await waitFor(() => {
      expect(screen.getByText('Nenhum registro de auditoria')).toBeInTheDocument();
      expect(
        screen.getByText(/nenhuma ação operacional foi registrada para este chamado até o momento/i),
      ).toBeInTheDocument();
    });
  });

  it('deve exibir mensagem de erro e permitir tentar novamente quando a busca falhar', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 'admin-1',
        name: 'Administrador',
        email: 'admin@test.com',
        role: 'ADMIN',
        active: true,
        createdAt: '2026-09-20T00:00:00.000Z',
        updatedAt: '2026-09-20T00:00:00.000Z',
      },
      accessToken: 'token',
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    } as AuthContextValue);

    vi.mocked(auditApi.getTicketAudit).mockRejectedValueOnce(
      new Error('Erro ao carregar auditoria'),
    );

    render(<TicketAuditSection ticketId="ticket-1" assigneeId="tech-1" />);

    await waitFor(() => {
      expect(screen.getByText('Erro ao carregar auditoria')).toBeInTheDocument();
    });

    vi.mocked(auditApi.getTicketAudit).mockResolvedValueOnce(mockAuditLogs);
    const retryBtn = screen.getByRole('button', { name: /tentar novamente/i });
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByText('Chamado Criado')).toBeInTheDocument();
    });
  });
});
