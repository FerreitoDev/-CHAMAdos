import type { Category } from '@/features/categories/types/categories.types'
import type { SafeUser } from '@/features/users/types/users.types'

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED'
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export interface Ticket {
  id: string
  title: string
  description: string
  status: TicketStatus
  priority: TicketPriority
  requesterId: string
  assigneeId: string | null
  categoryId: string
  createdAt: string
  updatedAt: string
  resolvedAt: string | null
  closedAt: string | null
  category: Category
  requester: SafeUser
  assignee: SafeUser | null
}

export interface CreateTicketPayload {
  title: string
  description: string
  priority?: TicketPriority
  categoryId: string
}

export interface AssignTicketPayload {
  assigneeId?: string
}

export interface ReassignTicketPayload {
  assigneeId: string
}

export interface ResolveTicketPayload {
  solutionNotes?: string
}

export interface ReopenTicketPayload {
  reopenReason?: string
}

export interface GetTicketsParams {
  status?: TicketStatus
  priority?: TicketPriority
  categoryId?: string
  assigneeId?: string
  search?: string
  page?: number
  limit?: number
}

export interface PaginatedTicketsResponse {
  data: Ticket[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}
