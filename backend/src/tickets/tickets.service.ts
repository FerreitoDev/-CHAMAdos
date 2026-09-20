import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { AuthenticatedUser } from '../auth/jwt.strategy';
import { Prisma, TicketPriority, TicketStatus, UserRole } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { FilterTicketsDto } from './dto/filter-tickets.dto';
import { PaginatedTicketsResponse, SafeTicket, safeUserSelect } from './tickets.types';

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(requesterId: string, dto: CreateTicketDto): Promise<SafeTicket> {
    const category = await this.prisma.category.findUnique({
      where: { id: dto.categoryId },
    });

    if (!category || !category.active) {
      throw new BadRequestException('Categoria inválida ou inativa');
    }

    const ticket = await this.prisma.ticket.create({
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority ?? TicketPriority.MEDIUM,
        status: TicketStatus.OPEN,
        requesterId,
        categoryId: dto.categoryId,
      },
      include: {
        category: true,
        requester: { select: safeUserSelect },
        assignee: { select: safeUserSelect },
      },
    });

    return ticket as SafeTicket;
  }

  async findAll(user: AuthenticatedUser, query: FilterTicketsDto): Promise<PaginatedTicketsResponse> {
    const page = query.page && query.page > 0 ? query.page : 1;
    const limit = query.limit && query.limit > 0 ? query.limit : 10;
    const skip = (page - 1) * limit;

    const where: Prisma.TicketWhereInput = {};

    if (user.role === UserRole.USER) {
      where.requesterId = user.id;
    } else if (user.role === UserRole.TECHNICIAN) {
      where.OR = [
        { assigneeId: null },
        { assigneeId: user.id },
        { requesterId: user.id },
      ];
    } else if (user.role === UserRole.ADMIN) {
      if (query.assigneeId) {
        where.assigneeId = query.assigneeId;
      }
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.priority) {
      where.priority = query.priority;
    }

    if (query.categoryId) {
      where.categoryId = query.categoryId;
    }

    if (query.search) {
      const searchFilter: Prisma.TicketWhereInput[] = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
      ];

      if (where.OR) {
        const roleOr = where.OR;
        delete where.OR;
        where.AND = [
          { OR: roleOr },
          { OR: searchFilter },
        ];
      } else {
        where.OR = searchFilter;
      }
    }

    const [tickets, total] = await Promise.all([
      this.prisma.ticket.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          requester: { select: safeUserSelect },
          assignee: { select: safeUserSelect },
        },
      }),
      this.prisma.ticket.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: tickets as SafeTicket[],
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  async findById(id: string, user: AuthenticatedUser): Promise<SafeTicket> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        category: true,
        requester: { select: safeUserSelect },
        assignee: { select: safeUserSelect },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Chamado não encontrado');
    }

    if (user.role === UserRole.USER) {
      if (ticket.requesterId !== user.id) {
        throw new ForbiddenException('Você não tem permissão para acessar este chamado');
      }
    } else if (user.role === UserRole.TECHNICIAN) {
      const isUnassigned = ticket.assigneeId === null;
      const isAssignee = ticket.assigneeId === user.id;
      const isRequester = ticket.requesterId === user.id;

      if (!isUnassigned && !isAssignee && !isRequester) {
        throw new ForbiddenException('Você não tem permissão para acessar este chamado');
      }
    }

    return ticket as SafeTicket;
  }
}
