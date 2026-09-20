import { Comment } from '../generated/prisma/client';
import { SafeUser } from '../users/users.types';

export type SafeComment = Omit<Comment, 'author' | 'ticket'> & {
  author: SafeUser;
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
