import React from 'react';
import type { Comment } from '../types/comments.types';
import { UserRoleBadge } from '@/features/users/components/UserRoleBadge';
import { Clock } from 'lucide-react';

interface CommentItemProps {
  comment: Comment;
}

export const CommentItem: React.FC<CommentItemProps> = ({ comment }) => {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div className="p-4 rounded-lg border border-border bg-card/60 hover:bg-card/90 transition-colors space-y-3 shadow-xs">
      {/* Cabeçalho do Comentário */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-primary/20 text-primary font-semibold text-xs flex items-center justify-center shrink-0">
            {getInitials(comment.author.name)}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">
              {comment.author.name}
            </span>
            <UserRoleBadge role={comment.author.role} />
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
          <Clock className="w-3.5 h-3.5 text-muted-foreground/70" />
          <span>{formatDate(comment.createdAt)}</span>
        </div>
      </div>

      {/* Conteúdo do Comentário */}
      <div className="text-sm text-foreground whitespace-pre-wrap leading-relaxed break-words">
        {comment.content}
      </div>
    </div>
  );
};
