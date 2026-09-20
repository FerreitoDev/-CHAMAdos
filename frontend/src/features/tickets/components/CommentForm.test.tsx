import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CommentForm } from './CommentForm';

describe('CommentForm', () => {
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar o formulário com textarea, contador e botão desabilitado inicialmente', () => {
    render(<CommentForm onSubmit={mockOnSubmit} />);

    const textarea = screen.getByPlaceholderText(
      'Escreva um comentário ou atualização sobre o chamado...',
    );
    const submitBtn = screen.getByRole('button', { name: /enviar comentário/i });

    expect(textarea).toBeInTheDocument();
    expect(submitBtn).toBeDisabled();
    expect(screen.getByText('0 / 5000 caracteres')).toBeInTheDocument();
  });

  it('deve habilitar o botão de envio quando o usuário digitar texto válido', () => {
    render(<CommentForm onSubmit={mockOnSubmit} />);

    const textarea = screen.getByPlaceholderText(
      'Escreva um comentário ou atualização sobre o chamado...',
    );
    const submitBtn = screen.getByRole('button', { name: /enviar comentário/i });

    fireEvent.change(textarea, { target: { value: 'Novo comentário técnico' } });

    expect(submitBtn).not.toBeDisabled();
    expect(screen.getByText('23 / 5000 caracteres')).toBeInTheDocument();
  });

  it('deve submeter o texto aparado e limpar o campo após sucesso', async () => {
    mockOnSubmit.mockResolvedValueOnce(undefined);
    render(<CommentForm onSubmit={mockOnSubmit} />);

    const textarea = screen.getByPlaceholderText(
      'Escreva um comentário ou atualização sobre o chamado...',
    );
    const submitBtn = screen.getByRole('button', { name: /enviar comentário/i });

    fireEvent.change(textarea, { target: { value: '  Comentário com espaços  ' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith('Comentário com espaços');
      expect(textarea).toHaveValue('');
    });
  });

  it('deve exibir mensagem de erro caso o envio falhe', async () => {
    mockOnSubmit.mockRejectedValueOnce(new Error('Falha ao conectar com o servidor'));
    render(<CommentForm onSubmit={mockOnSubmit} />);

    const textarea = screen.getByPlaceholderText(
      'Escreva um comentário ou atualização sobre o chamado...',
    );
    const submitBtn = screen.getByRole('button', { name: /enviar comentário/i });

    fireEvent.change(textarea, { target: { value: 'Comentário teste' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Falha ao conectar com o servidor')).toBeInTheDocument();
    });
  });

  it('deve renderizar estado de loading quando isSubmitting for true', () => {
    render(<CommentForm onSubmit={mockOnSubmit} isSubmitting={true} />);

    expect(screen.getByText(/enviando.../i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Escreva um comentário ou atualização sobre o chamado...'),
    ).toBeDisabled();
  });

  it('deve exibir aviso de chamado encerrado e ocultar formulário quando isClosed for true', () => {
    render(<CommentForm onSubmit={mockOnSubmit} isClosed={true} />);

    expect(
      screen.getByText(/este chamado está encerrado\. novos comentários estão desabilitados\./i),
    ).toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText('Escreva um comentário ou atualização sobre o chamado...'),
    ).not.toBeInTheDocument();
  });
});
