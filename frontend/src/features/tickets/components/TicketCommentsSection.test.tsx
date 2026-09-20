import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { commentsApi } from '../api/comments.api';
import { TicketCommentsSection } from './TicketCommentsSection';
import type { Comment } from '../types/comments.types';

vi.mock('../api/comments.api', () => ({
  commentsApi: {
    getComments: vi.fn(),
    createComment: vi.fn(),
  },
}));

describe('TicketCommentsSection', () => {
  const mockComments: Comment[] = [
    {
      id: 'comment-1',
      content: 'Primeiro comentário técnico',
      ticketId: 'ticket-1',
      authorId: 'user-1',
      createdAt: '2026-09-20T10:00:00.000Z',
      author: {
        id: 'user-1',
        name: 'Maria Técnica',
        email: 'maria@test.com',
        role: 'TECHNICIAN',
        active: true,
        createdAt: '2026-09-20T00:00:00.000Z',
        updatedAt: '2026-09-20T00:00:00.000Z',
      },
    },
    {
      id: 'comment-2',
      content: 'Segundo comentário do usuário',
      ticketId: 'ticket-1',
      authorId: 'user-2',
      createdAt: '2026-09-20T11:00:00.000Z',
      author: {
        id: 'user-2',
        name: 'Carlos Usuário',
        email: 'carlos@test.com',
        role: 'USER',
        active: true,
        createdAt: '2026-09-20T00:00:00.000Z',
        updatedAt: '2026-09-20T00:00:00.000Z',
      },
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve buscar e exibir os comentários ao carregar', async () => {
    vi.mocked(commentsApi.getComments).mockResolvedValueOnce(mockComments);

    render(<TicketCommentsSection ticketId="ticket-1" />);

    expect(commentsApi.getComments).toHaveBeenCalledWith('ticket-1');

    await waitFor(() => {
      expect(screen.getByText('Primeiro comentário técnico')).toBeInTheDocument();
      expect(screen.getByText('Segundo comentário do usuário')).toBeInTheDocument();
      expect(screen.getByText('Maria Técnica')).toBeInTheDocument();
      expect(screen.getByText('Carlos Usuário')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  it('deve exibir mensagem de estado vazio quando não houver comentários', async () => {
    vi.mocked(commentsApi.getComments).mockResolvedValueOnce([]);

    render(<TicketCommentsSection ticketId="ticket-1" />);

    await waitFor(() => {
      expect(screen.getByText('Nenhum comentário registrado')).toBeInTheDocument();
      expect(
        screen.getByText(/utilize o campo abaixo para enviar a primeira mensagem/i),
      ).toBeInTheDocument();
    });
  });

  it('deve exibir mensagem de erro e permitir tentar novamente quando a busca falhar', async () => {
    vi.mocked(commentsApi.getComments).mockRejectedValueOnce(new Error('Erro de rede'));

    render(<TicketCommentsSection ticketId="ticket-1" />);

    await waitFor(() => {
      expect(screen.getByText('Erro de rede')).toBeInTheDocument();
    });

    vi.mocked(commentsApi.getComments).mockResolvedValueOnce(mockComments);
    const retryBtn = screen.getByRole('button', { name: /tentar novamente/i });
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByText('Primeiro comentário técnico')).toBeInTheDocument();
    });
  });

  it('deve enviar novo comentário e adicionar à lista em tempo real', async () => {
    vi.mocked(commentsApi.getComments).mockResolvedValueOnce([mockComments[0]]);

    const newCreatedComment: Comment = {
      id: 'comment-new',
      content: 'Comentário recém-adicionado',
      ticketId: 'ticket-1',
      authorId: 'user-1',
      createdAt: '2026-09-20T12:00:00.000Z',
      author: {
        id: 'user-1',
        name: 'Maria Técnica',
        email: 'maria@test.com',
        role: 'TECHNICIAN',
        active: true,
        createdAt: '2026-09-20T00:00:00.000Z',
        updatedAt: '2026-09-20T00:00:00.000Z',
      },
    };

    vi.mocked(commentsApi.createComment).mockResolvedValueOnce(newCreatedComment);

    render(<TicketCommentsSection ticketId="ticket-1" />);

    await waitFor(() => {
      expect(screen.getByText('Primeiro comentário técnico')).toBeInTheDocument();
    });

    const textarea = screen.getByPlaceholderText(
      'Escreva um comentário ou atualização sobre o chamado...',
    );
    const submitBtn = screen.getByRole('button', { name: /enviar comentário/i });

    fireEvent.change(textarea, { target: { value: 'Comentário recém-adicionado' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(commentsApi.createComment).toHaveBeenCalledWith('ticket-1', {
        content: 'Comentário recém-adicionado',
      });
      expect(screen.getByText('Comentário recém-adicionado')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  it('deve repassar isClosed para o formulário quando o chamado estiver encerrado', async () => {
    vi.mocked(commentsApi.getComments).mockResolvedValueOnce([]);

    render(<TicketCommentsSection ticketId="ticket-1" isClosed={true} />);

    await waitFor(() => {
      expect(
        screen.getByText(/este chamado está encerrado\. novos comentários estão desabilitados\./i),
      ).toBeInTheDocument();
    });
  });
});
