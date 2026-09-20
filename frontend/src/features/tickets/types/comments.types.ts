import type { SafeUser } from '@/features/users/types/users.types';

export interface Comment {
  id: string;
  content: string;
  ticketId: string;
  authorId: string;
  createdAt: string;
  author: SafeUser;
}

export interface CreateCommentPayload {
  content: string;
}
