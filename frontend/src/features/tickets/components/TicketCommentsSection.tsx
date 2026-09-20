import React, { useCallback, useEffect, useState } from 'react';
import { commentsApi } from '../api/comments.api';
import type { Comment } from '../types/comments.types';
import { CommentForm } from './CommentForm';
import { CommentItem } from './CommentItem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, MessageSquare, MessageSquareDashed, RefreshCw } from 'lucide-react';

interface TicketCommentsSectionProps {
  ticketId: string;
  isClosed?: boolean;
}

export const TicketCommentsSection: React.FC<TicketCommentsSectionProps> = ({
  ticketId,
  isClosed = false,
}) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await commentsApi.getComments(ticketId);
      setComments(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao carregar comentários do chamado.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleCreateComment = async (content: string) => {
    try {
      setIsSubmitting(true);
      const newComment = await commentsApi.createComment(ticketId, { content });
      setComments((prev) => [...prev, newComment]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-xs border-border bg-card">
      <CardHeader className="pb-3 border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            Comentários
            {!isLoading && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted font-normal text-muted-foreground">
                {comments.length}
              </span>
            )}
          </CardTitle>

          {error && (
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchComments}
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Recarregar
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-6">
        {/* Estado de Carregamento */}
        {isLoading && (
          <div className="space-y-3 py-2 animate-pulse">
            <div className="h-16 rounded-lg bg-muted/40" />
            <div className="h-16 rounded-lg bg-muted/40" />
          </div>
        )}

        {/* Estado de Erro */}
        {!isLoading && error && (
          <div className="p-4 rounded-lg bg-destructive/15 border border-destructive/30 text-destructive text-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchComments}
              className="text-xs border-destructive/30 hover:bg-destructive/10"
            >
              Tentar novamente
            </Button>
          </div>
        )}

        {/* Estado Vazio */}
        {!isLoading && !error && comments.length === 0 && (
          <div className="text-center py-8 px-4 rounded-lg border border-dashed border-border/80 bg-muted/10 space-y-2">
            <MessageSquareDashed className="w-8 h-8 mx-auto text-muted-foreground/60" />
            <p className="text-sm font-medium text-foreground">
              Nenhum comentário registrado
            </p>
            <p className="text-xs text-muted-foreground">
              {isClosed
                ? 'Nenhum comentário foi adicionado antes do encerramento deste chamado.'
                : 'Utilize o campo abaixo para enviar a primeira mensagem ou atualização técnica.'}
            </p>
          </div>
        )}

        {/* Lista de Comentários */}
        {!isLoading && !error && comments.length > 0 && (
          <div className="space-y-3">
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        )}

        {/* Formulário de Envio */}
        <div className="border-t border-border/60 pt-4">
          <CommentForm
            onSubmit={handleCreateComment}
            isSubmitting={isSubmitting}
            isClosed={isClosed}
          />
        </div>
      </CardContent>
    </Card>
  );
};
