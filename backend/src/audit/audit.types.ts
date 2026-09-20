import { Audit } from '../generated/prisma/client';
import { SafeUser } from '../users/users.types';
import { AuditAction } from './audit.constants';

export type SafeAudit = Omit<Audit, 'actor' | 'ticket'> & {
  actor: SafeUser | null;
};

export const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  active: true,
  createdAt: true,
  updatedAt: true,
} as const;

export type { AuditAction };
