import { apiClient } from '@/shared/api/client'
import type {
  CreateTicketPayload,
  GetTicketsParams,
  PaginatedTicketsResponse,
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
}
