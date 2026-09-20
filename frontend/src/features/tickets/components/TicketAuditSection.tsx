import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/use-auth';
import { auditApi } from '../api/audit.api';
import type { AuditItem } from '../types/audit.types';
import { TicketAuditItem } from './TicketAuditItem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, History, RefreshCw, ShieldAlert } from 'lucide-react';

interface TicketAuditSectionProps {
  ticketId: string;
  assigneeId?: string | null;
}

export const TicketAuditSection: React.FC<TicketAuditSectionProps> = ({
  ticketId,
  assigneeId,
}) => {
  const { user } = useAuth();

  const [auditLogs, setAuditLogs] = useState<AuditItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.role === 'ADMIN';
  const isAssignee = user?.role === 'TECHNICIAN' && Boolean(user?.id && user.id === assigneeId);
  const isAuthorized = isAdmin || isAssignee;

  const fetchAuditLogs = useCallback(async () => {
    if (!isAuthorized) return;

    try {
      setIsLoading(true);
      setError(null);
      const data = await auditApi.getTicketAudit(ticketId);
      setAuditLogs(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao carregar histórico de auditoria.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [ticketId, isAuthorized]);

  useEffect(() => {
    if (isAuthorized) {
      fetchAuditLogs();
    }
  }, [fetchAuditLogs, isAuthorized]);

  // Se o usuário não tiver permissão para auditoria (USER ou técnico não atribuído), não renderiza
  if (!user || !isAuthorized) {
    return null;
  }

  return (
    <Card className="shadow-xs border-border bg-card">
      <CardHeader className="pb-3 border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <History className="w-4 h-4 text-primary" />
            Histórico de Auditoria
            {!isLoading && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-muted font-normal text-muted-foreground">
                {auditLogs.length}
              </span>
            )}
          </CardTitle>

          {error && (
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchAuditLogs}
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Recarregar
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4 py-2 animate-pulse">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted/60 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 bg-muted/60 rounded-sm" />
                <div className="h-3 w-2/3 bg-muted/40 rounded-sm" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted/60 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/4 bg-muted/60 rounded-sm" />
                <div className="h-3 w-1/2 bg-muted/40 rounded-sm" />
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="p-4 rounded-lg bg-destructive/15 border border-destructive/30 text-destructive text-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAuditLogs}
              className="text-xs border-destructive/30 hover:bg-destructive/10"
            >
              Tentar novamente
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && auditLogs.length === 0 && (
          <div className="text-center py-6 px-4 rounded-lg border border-dashed border-border/80 bg-muted/10 space-y-1">
            <ShieldAlert className="w-6 h-6 mx-auto text-muted-foreground/60" />
            <p className="text-sm font-medium text-foreground">
              Nenhum registro de auditoria
            </p>
            <p className="text-xs text-muted-foreground">
              Nenhuma ação operacional foi registrada para este chamado até o momento.
            </p>
          </div>
        )}

        {/* Lista da Linha do Tempo */}
        {!isLoading && !error && auditLogs.length > 0 && (
          <div className="space-y-0">
            {auditLogs.map((audit, index) => (
              <TicketAuditItem
                key={audit.id}
                audit={audit}
                isLast={index === auditLogs.length - 1}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
