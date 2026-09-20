import { beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient } from '@/shared/api/client';
import { commentsApi } from './comments.api';
import type { Comment } from '../types/comments.types';

vi.mock('@/shared/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('commentsApi', () => {
  const mockComment: Comment = {
    id: 'comment-1',
    content: 'Comentário de teste',
    ticketId: 'ticket-1',
    authorId: 'user-1',
    createdAt: '2026-09-20T10:00:00.000Z',
    author: {
      id: 'user-1',
      name: 'User Test',
      email: 'user@test.com',
      role: 'USER',
      active: true,
      createdAt: '2026-09-20T00:00:00.000Z',
      updatedAt: '2026-09-20T00:00:00.000Z',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getComments deve chamar GET /tickets/:ticketId/comments e retornar a lista de comentários', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: [mockComment] });

    const result = await commentsApi.getComments('ticket-1');

    expect(apiClient.get).toHaveBeenCalledWith('/tickets/ticket-1/comments');
    expect(result).toEqual([mockComment]);
  });

  it('createComment deve chamar POST /tickets/:ticketId/comments com payload e retornar o comentário criado', async () => {
    const payload = { content: 'Comentário de teste' };
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockComment });

    const result = await commentsApi.createComment('ticket-1', payload);

    expect(apiClient.post).toHaveBeenCalledWith('/tickets/ticket-1/comments', payload);
    expect(result).toEqual(mockComment);
  });
});
