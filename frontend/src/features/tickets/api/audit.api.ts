import { apiClient } from '@/shared/api/client';
import type { AuditItem } from '../types/audit.types';

export const auditApi = {
  async getTicketAudit(ticketId: string): Promise<AuditItem[]> {
    const { data } = await apiClient.get<AuditItem[]>(`/tickets/${ticketId}/audit`);
    return data;
  },
};
