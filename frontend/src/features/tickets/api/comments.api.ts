import { apiClient } from '@/shared/api/client';
import type { Comment, CreateCommentPayload } from '../types/comments.types';

export const commentsApi = {
  async getComments(ticketId: string): Promise<Comment[]> {
    const { data } = await apiClient.get<Comment[]>(`/tickets/${ticketId}/comments`);
    return data;
  },

  async createComment(ticketId: string, payload: CreateCommentPayload): Promise<Comment> {
    const { data } = await apiClient.post<Comment>(`/tickets/${ticketId}/comments`, payload);
    return data;
  },
};
