import type { SafeUser } from '@/features/users/types/users.types';

export const AUDIT_ACTIONS = {
  TICKET_CREATED: 'TICKET_CREATED',
  TICKET_ASSIGNED: 'TICKET_ASSIGNED',
  TICKET_REASSIGNED: 'TICKET_REASSIGNED',
  TICKET_RESOLVED: 'TICKET_RESOLVED',
  TICKET_CLOSED: 'TICKET_CLOSED',
  TICKET_REOPENED: 'TICKET_REOPENED',
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

export interface AuditItem {
  id: string;
  action: AuditAction | string;
  data: Record<string, unknown> | null;
  ticketId: string | null;
  actorId: string | null;
  createdAt: string;
  actor: SafeUser | null;
}
