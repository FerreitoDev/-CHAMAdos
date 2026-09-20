import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2, Lock, Send } from 'lucide-react';

interface CommentFormProps {
  onSubmit: (content: string) => Promise<void>;
  isSubmitting?: boolean;
  isClosed?: boolean;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  onSubmit,
  isSubmitting = false,
  isClosed = false,
}) => {
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (isClosed) {
    return (
      <div className="p-4 rounded-lg bg-muted/30 border border-border text-muted-foreground text-xs sm:text-sm flex items-center gap-2.5">
        <Lock className="w-4 h-4 text-muted-foreground/80 shrink-0" />
        <span>Este chamado está encerrado. Novos comentários estão desabilitados.</span>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || isSubmitting) return;

    try {
      setError(null);
      await onSubmit(trimmed);
      setContent('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao enviar comentário. Tente novamente.');
      }
    }
  };

  const isButtonDisabled = isSubmitting || !content.trim() || content.length > 5000;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Alerta de erro */}
      {error && (
        <div className="p-3 rounded-lg bg-destructive/15 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Textarea */}
      <div className="space-y-1.5">
        <textarea
          rows={3}
          placeholder="Escreva um comentário ou atualização sobre o chamado..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isSubmitting}
          maxLength={5000}
          className="w-full rounded-lg border border-input bg-background/80 px-3 py-2.5 text-sm shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring text-foreground placeholder:text-muted-foreground resize-none"
        />
        
        {/* Contador de caracteres e botão */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-xs text-muted-foreground/80 font-mono">
            {content.length} / 5000 caracteres
          </span>

          <Button
            type="submit"
            size="sm"
            disabled={isButtonDisabled}
            className="shrink-0"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-1.5" />
                Enviar Comentário
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};
