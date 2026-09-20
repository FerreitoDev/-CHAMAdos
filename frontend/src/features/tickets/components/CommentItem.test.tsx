import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CommentItem } from './CommentItem';
import type { Comment } from '../types/comments.types';

describe('CommentItem', () => {
  const mockComment: Comment = {
    id: 'comment-1',
    content: 'Cabo de rede substituído. Aguardando teste.',
    ticketId: 'ticket-1',
    authorId: 'user-1',
    createdAt: '2026-09-20T14:30:00.000Z',
    author: {
      id: 'user-1',
      name: 'Carlos Silva',
      email: 'carlos@empresa.com',
      role: 'TECHNICIAN',
      active: true,
      createdAt: '2026-09-20T00:00:00.000Z',
      updatedAt: '2026-09-20T00:00:00.000Z',
    },
  };

  it('deve renderizar o autor, cargo, conteúdo e data do comentário', () => {
    render(<CommentItem comment={mockComment} />);

    expect(screen.getByText('Carlos Silva')).toBeInTheDocument();
    expect(screen.getByText('Técnico')).toBeInTheDocument();
    expect(screen.getByText('Cabo de rede substituído. Aguardando teste.')).toBeInTheDocument();
    expect(screen.getByText('CS')).toBeInTheDocument();
  });

  it('deve renderizar badge para Administrador quando autor for ADMIN', () => {
    const adminComment: Comment = {
      ...mockComment,
      author: {
        ...mockComment.author,
        name: 'Ana Maria Admin',
        role: 'ADMIN',
      },
    };

    render(<CommentItem comment={adminComment} />);

    expect(screen.getByText('Ana Maria Admin')).toBeInTheDocument();
    expect(screen.getByText('Administrador')).toBeInTheDocument();
    expect(screen.getByText('AA')).toBeInTheDocument();
  });

  it('deve renderizar badge para Usuário quando autor for USER', () => {
    const userComment: Comment = {
      ...mockComment,
      author: {
        ...mockComment.author,
        name: 'Roberto',
        role: 'USER',
      },
    };

    render(<CommentItem comment={userComment} />);

    expect(screen.getByText('Roberto')).toBeInTheDocument();
    expect(screen.getByText('Usuário')).toBeInTheDocument();
    expect(screen.getByText('R')).toBeInTheDocument();
  });
});
