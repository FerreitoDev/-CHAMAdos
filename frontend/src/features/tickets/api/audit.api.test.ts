import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/shared/api/client';
import { auditApi } from './audit.api';
import { AUDIT_ACTIONS, type AuditItem } from '../types/audit.types';

vi.mock('@/shared/api/client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe('auditApi', () => {
  const mockAuditItem: AuditItem = {
    id: 'audit-1',
    action: AUDIT_ACTIONS.TICKET_CREATED,
    data: { title: 'Problema com monitor' },
    ticketId: 'ticket-1',
    actorId: 'user-1',
    createdAt: '2026-09-20T10:00:00.000Z',
    actor: {
      id: 'user-1',
      name: 'João Usuário',
      email: 'joao@test.com',
      role: 'USER',
      active: true,
      createdAt: '2026-09-20T00:00:00.000Z',
      updatedAt: '2026-09-20T00:00:00.000Z',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getTicketAudit deve chamar GET /tickets/:ticketId/audit e retornar os registros', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: [mockAuditItem] });

    const result = await auditApi.getTicketAudit('ticket-1');

    expect(apiClient.get).toHaveBeenCalledWith('/tickets/ticket-1/audit');
    expect(result).toEqual([mockAuditItem]);
  });

  it('getTicketAudit deve propagar exceções caso a requisição falhe', async () => {
    vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Acesso negado'));

    await expect(auditApi.getTicketAudit('ticket-1')).rejects.toThrow('Acesso negado');
  });
});
