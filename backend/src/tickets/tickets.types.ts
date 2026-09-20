import { Category, Ticket } from '../generated/prisma';
import { SafeUser } from '../users/users.types';

export type SafeTicket = Omit<Ticket, 'requester' | 'assignee'> & {
  category: Category;
  requester: SafeUser;
  assignee: SafeUser | null;
};

export interface PaginatedTicketsResponse {
  data: SafeTicket[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const safeUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  active: true,
  createdAt: true,
  updatedAt: true,
} as const;
