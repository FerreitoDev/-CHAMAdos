import { apiClient } from '@/shared/api/client'
import type {
  AssignTicketPayload,
  CreateTicketPayload,
  GetTicketsParams,
  PaginatedTicketsResponse,
  ReassignTicketPayload,
  ReopenTicketPayload,
  ResolveTicketPayload,
  Ticket,
} from '../types/tickets.types'

export const ticketsApi = {
  async getTickets(params?: GetTicketsParams): Promise<PaginatedTicketsResponse> {
    const { data } = await apiClient.get<PaginatedTicketsResponse>('/tickets', { params })
    return data
  },

  async getTicketById(id: string): Promise<Ticket> {
    const { data } = await apiClient.get<Ticket>(`/tickets/${id}`)
    return data
  },

  async createTicket(payload: CreateTicketPayload): Promise<Ticket> {
    const { data } = await apiClient.post<Ticket>('/tickets', payload)
    return data
  },

  async assignTicket(id: string, payload?: AssignTicketPayload): Promise<Ticket> {
    const { data } = await apiClient.patch<Ticket>(`/tickets/${id}/assign`, payload)
    return data
  },

  async reassignTicket(id: string, payload: ReassignTicketPayload): Promise<Ticket> {
    const { data } = await apiClient.patch<Ticket>(`/tickets/${id}/reassign`, payload)
    return data
  },

  async resolveTicket(id: string, payload?: ResolveTicketPayload): Promise<Ticket> {
    const { data } = await apiClient.patch<Ticket>(`/tickets/${id}/resolve`, payload)
    return data
  },

  async closeTicket(id: string): Promise<Ticket> {
    const { data } = await apiClient.patch<Ticket>(`/tickets/${id}/close`)
    return data
  },

  async reopenTicket(id: string, payload?: ReopenTicketPayload): Promise<Ticket> {
    const { data } = await apiClient.patch<Ticket>(`/tickets/${id}/reopen`, payload)
    return data
  },
}
