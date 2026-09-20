import { ForbiddenException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { AuthenticatedUser } from '../auth/jwt.strategy';
import { TicketStatus, UserRole } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { SafeComment, safeUserSelect } from './comments.types';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(ticketId: string, user: AuthenticatedUser, dto: CreateCommentDto): Promise<SafeComment> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Chamado não encontrado');
    }

    if (ticket.status === TicketStatus.CLOSED) {
      throw new UnprocessableEntityException('Não é possível adicionar comentários em um chamado encerrado');
    }

    if (user.role === UserRole.USER) {
      if (ticket.requesterId !== user.id) {
        throw new ForbiddenException('Você não tem permissão para comentar neste chamado');
      }
    } else if (user.role === UserRole.TECHNICIAN) {
      const isAssignee = ticket.assigneeId === user.id;
      const isRequester = ticket.requesterId === user.id;

      if (!isAssignee && !isRequester) {
        throw new ForbiddenException('Você não tem permissão para comentar neste chamado');
      }
    }

    const comment = await this.prisma.comment.create({
      data: {
        content: dto.content,
        ticketId,
        authorId: user.id,
      },
      include: {
        author: { select: safeUserSelect },
      },
    });

    return comment as SafeComment;
  }

  async findAllByTicket(ticketId: string, user: AuthenticatedUser): Promise<SafeComment[]> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Chamado não encontrado');
    }

    if (user.role === UserRole.USER) {
      if (ticket.requesterId !== user.id) {
        throw new ForbiddenException('Você não tem permissão para acessar os comentários deste chamado');
      }
    } else if (user.role === UserRole.TECHNICIAN) {
      const isUnassigned = ticket.assigneeId === null;
      const isAssignee = ticket.assigneeId === user.id;
      const isRequester = ticket.requesterId === user.id;

      if (!isUnassigned && !isAssignee && !isRequester) {
        throw new ForbiddenException('Você não tem permissão para acessar os comentários deste chamado');
      }
    }

    const comments = await this.prisma.comment.findMany({
      where: { ticketId },
      orderBy: { createdAt: 'asc' },
      include: {
        author: { select: safeUserSelect },
      },
    });

    return comments as SafeComment[];
  }
}
