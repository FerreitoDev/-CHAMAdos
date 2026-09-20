import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { AuthenticatedUser } from '../auth/jwt.strategy';
import { Prisma, TicketPriority, TicketStatus, UserRole } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AssignTicketDto } from './dto/assign-ticket.dto';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { FilterTicketsDto } from './dto/filter-tickets.dto';
import { ReassignTicketDto } from './dto/reassign-ticket.dto';
import { ReopenTicketDto } from './dto/reopen-ticket.dto';
import { ResolveTicketDto } from './dto/resolve-ticket.dto';
import { PaginatedTicketsResponse, SafeTicket, safeUserSelect } from './tickets.types';

@Injectable()
export class TicketsService {
  constructor(private readonly prisma: PrismaService) {}

  private readonly validTransitions: Record<TicketStatus, TicketStatus[]> = {
    [TicketStatus.OPEN]: [TicketStatus.IN_PROGRESS],
    [TicketStatus.IN_PROGRESS]: [TicketStatus.OPEN, TicketStatus.RESOLVED],
    [TicketStatus.RESOLVED]: [TicketStatus.CLOSED, TicketStatus.OPEN],
    [TicketStatus.CLOSED]: [TicketStatus.OPEN],
  };

  validateStateTransition(currentStatus: TicketStatus, targetStatus: TicketStatus): void {
    if (currentStatus === targetStatus) return;

    const allowed = this.validTransitions[currentStatus] || [];
    if (!allowed.includes(targetStatus)) {
      throw new UnprocessableEntityException(
        `Transição de estado inválida de ${currentStatus} para ${targetStatus}`,
      );
    }
  }

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

  async assign(id: string, user: AuthenticatedUser, dto?: AssignTicketDto): Promise<SafeTicket> {
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

    let targetAssigneeId = user.id;

    if (user.role === UserRole.TECHNICIAN) {
      const settings = await this.prisma.systemSettings.findFirst();
      const allowSelfAssign = settings ? settings.allowTechnicianSelfAssignment : true;

      if (!allowSelfAssign) {
        throw new ForbiddenException('Autoatribuição de técnicos está desabilitada pelo sistema');
      }

      if (ticket.assigneeId && ticket.assigneeId !== user.id) {
        throw new ForbiddenException('Este chamado já está atribuído a outro técnico');
      }
    } else if (user.role === UserRole.ADMIN) {
      if (dto?.assigneeId) {
        targetAssigneeId = dto.assigneeId;
      }
    }

    const targetTech = await this.prisma.user.findUnique({
      where: { id: targetAssigneeId },
    });

    if (!targetTech || !targetTech.active || (targetTech.role !== UserRole.TECHNICIAN && targetTech.role !== UserRole.ADMIN)) {
      throw new BadRequestException('Técnico inválido ou inativo');
    }

    if (ticket.status !== TicketStatus.IN_PROGRESS) {
      this.validateStateTransition(ticket.status, TicketStatus.IN_PROGRESS);
    }

    const updated = await this.prisma.ticket.update({
      where: { id },
      data: {
        assigneeId: targetAssigneeId,
        status: TicketStatus.IN_PROGRESS,
      },
      include: {
        category: true,
        requester: { select: safeUserSelect },
        assignee: { select: safeUserSelect },
      },
    });

    return updated as SafeTicket;
  }

  async reassign(id: string, user: AuthenticatedUser, dto: ReassignTicketDto): Promise<SafeTicket> {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Apenas administradores podem reatribuir chamados');
    }

    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      throw new NotFoundException('Chamado não encontrado');
    }

    const newTech = await this.prisma.user.findUnique({
      where: { id: dto.assigneeId },
    });

    if (!newTech || !newTech.active || (newTech.role !== UserRole.TECHNICIAN && newTech.role !== UserRole.ADMIN)) {
      throw new BadRequestException('Técnico inválido ou inativo');
    }

    const newStatus = ticket.status === TicketStatus.OPEN ? TicketStatus.IN_PROGRESS : ticket.status;

    const updated = await this.prisma.ticket.update({
      where: { id },
      data: {
        assigneeId: dto.assigneeId,
        status: newStatus,
      },
      include: {
        category: true,
        requester: { select: safeUserSelect },
        assignee: { select: safeUserSelect },
      },
    });

    return updated as SafeTicket;
  }

  async resolve(id: string, user: AuthenticatedUser, _dto?: ResolveTicketDto): Promise<SafeTicket> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      throw new NotFoundException('Chamado não encontrado');
    }

    if (user.role !== UserRole.ADMIN && ticket.assigneeId !== user.id) {
      throw new ForbiddenException('Apenas o técnico responsável ou um administrador podem resolver este chamado');
    }

    this.validateStateTransition(ticket.status, TicketStatus.RESOLVED);

    const updated = await this.prisma.ticket.update({
      where: { id },
      data: {
        status: TicketStatus.RESOLVED,
        resolvedAt: new Date(),
      },
      include: {
        category: true,
        requester: { select: safeUserSelect },
        assignee: { select: safeUserSelect },
      },
    });

    return updated as SafeTicket;
  }

  async close(id: string, user: AuthenticatedUser): Promise<SafeTicket> {
    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Apenas administradores podem encerrar chamados');
    }

    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      throw new NotFoundException('Chamado não encontrado');
    }

    if (ticket.status !== TicketStatus.RESOLVED) {
      throw new UnprocessableEntityException('Um chamado só pode ser encerrado após ser resolvido');
    }

    const updated = await this.prisma.ticket.update({
      where: { id },
      data: {
        status: TicketStatus.CLOSED,
        closedAt: new Date(),
      },
      include: {
        category: true,
        requester: { select: safeUserSelect },
        assignee: { select: safeUserSelect },
      },
    });

    return updated as SafeTicket;
  }

  async reopen(id: string, user: AuthenticatedUser, _dto?: ReopenTicketDto): Promise<SafeTicket> {
    const ticket = await this.prisma.ticket.findUnique({
      where: { id },
    });

    if (!ticket) {
      throw new NotFoundException('Chamado não encontrado');
    }

    if (user.role !== UserRole.ADMIN && ticket.requesterId !== user.id) {
      throw new ForbiddenException('Apenas o solicitante do chamado ou um administrador podem reabri-lo');
    }

    if (ticket.status !== TicketStatus.RESOLVED && ticket.status !== TicketStatus.CLOSED) {
      throw new UnprocessableEntityException(
        `Transição de estado inválida de ${ticket.status} para ${TicketStatus.OPEN}`,
      );
    }

    const updated = await this.prisma.ticket.update({
      where: { id },
      data: {
        status: TicketStatus.OPEN,
        resolvedAt: null,
        closedAt: null,
      },
      include: {
        category: true,
        requester: { select: safeUserSelect },
        assignee: { select: safeUserSelect },
      },
    });

    return updated as SafeTicket;
  }
}
