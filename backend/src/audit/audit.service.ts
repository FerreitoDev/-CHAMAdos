import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AuthenticatedUser } from '../auth/jwt.strategy';
import { Prisma, UserRole } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditAction } from './audit.constants';
import { SafeAudit, safeUserSelect } from './audit.types';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(
    action: AuditAction | string,
    ticketId?: string,
    actorId?: string,
    data?: Prisma.InputJsonValue | Record<string, unknown>,
  ): Promise<SafeAudit> {
    const audit = await this.prisma.audit.create({
      data: {
        action,
        ticketId: ticketId ?? null,
        actorId: actorId ?? null,
        data: data !== undefined ? (data as Prisma.InputJsonValue) : Prisma.DbNull,
      },
      include: {
        actor: { select: safeUserSelect },
      },
    });

    return audit as SafeAudit;
  }

  async findAllByTicket(ticketId: string, user: AuthenticatedUser): Promise<SafeAudit[]> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Chamado não encontrado');
    }

    if (user.role === UserRole.USER) {
      throw new ForbiddenException('Você não tem permissão para acessar o histórico de auditoria deste chamado');
    }

    if (user.role === UserRole.TECHNICIAN) {
      const isAssignee = ticket.assigneeId === user.id;

      if (!isAssignee) {
        throw new ForbiddenException('Você não tem permissão para acessar o histórico de auditoria deste chamado');
      }
    }

    const audits = await this.prisma.audit.findMany({
      where: { ticketId },
      orderBy: { createdAt: 'asc' },
      include: {
        actor: { select: safeUserSelect },
      },
    });

    return audits as SafeAudit[];
  }
}
