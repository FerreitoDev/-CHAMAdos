import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticatedUser } from '../auth/jwt.strategy';
import { Prisma, TicketPriority, TicketStatus, UserRole } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AUDIT_ACTIONS } from './audit.constants';
import { AuditService } from './audit.service';

describe('AuditService', () => {
  let service: AuditService;
  let prismaService: PrismaService;

  const mockUser: AuthenticatedUser = {
    id: 'user-uuid-1',
    email: 'user@test.com',
    role: UserRole.USER,
  };

  const mockTech: AuthenticatedUser = {
    id: 'tech-uuid-1',
    email: 'tech@test.com',
    role: UserRole.TECHNICIAN,
  };

  const mockOtherTech: AuthenticatedUser = {
    id: 'tech-uuid-2',
    email: 'othertech@test.com',
    role: UserRole.TECHNICIAN,
  };

  const mockAdmin: AuthenticatedUser = {
    id: 'admin-uuid-1',
    email: 'admin@test.com',
    role: UserRole.ADMIN,
  };

  const mockTicket = {
    id: 'ticket-uuid-1',
    title: 'Falha de conectividade',
    description: 'Sem internet no setor fiscal',
    status: TicketStatus.IN_PROGRESS,
    priority: TicketPriority.HIGH,
    requesterId: mockUser.id,
    assigneeId: mockTech.id,
    categoryId: 'cat-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    resolvedAt: null,
    closedAt: null,
  };

  const mockAudit = {
    id: 'audit-uuid-1',
    action: AUDIT_ACTIONS.TICKET_CREATED,
    data: { title: 'Falha de conectividade', priority: 'HIGH' },
    ticketId: mockTicket.id,
    actorId: mockUser.id,
    createdAt: new Date(),
    actor: {
      id: mockUser.id,
      name: 'User Test',
      email: mockUser.email,
      role: UserRole.USER,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  const mockPrismaService = {
    ticket: {
      findUnique: jest.fn(),
    },
    audit: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('log', () => {
    it('deve registrar um evento de auditoria com dados completos', async () => {
      mockPrismaService.audit.create.mockResolvedValue(mockAudit);

      const payload = { title: 'Falha de conectividade', priority: 'HIGH' };
      const result = await service.log(
        AUDIT_ACTIONS.TICKET_CREATED,
        mockTicket.id,
        mockUser.id,
        payload,
      );

      expect(prismaService.audit.create).toHaveBeenCalledWith({
        data: {
          action: AUDIT_ACTIONS.TICKET_CREATED,
          ticketId: mockTicket.id,
          actorId: mockUser.id,
          data: payload,
        },
        include: expect.any(Object),
      });
      expect(result).toEqual(mockAudit);
    });

    it('deve registrar um evento de auditoria sem parâmetros opcionais', async () => {
      mockPrismaService.audit.create.mockResolvedValue({
        id: 'audit-uuid-2',
        action: AUDIT_ACTIONS.TICKET_CREATED,
        data: null,
        ticketId: null,
        actorId: null,
        createdAt: new Date(),
        actor: null,
      });

      const result = await service.log(AUDIT_ACTIONS.TICKET_CREATED);

      expect(prismaService.audit.create).toHaveBeenCalledWith({
        data: {
          action: AUDIT_ACTIONS.TICKET_CREATED,
          ticketId: null,
          actorId: null,
          data: Prisma.DbNull,
        },
        include: expect.any(Object),
      });
      expect(result.ticketId).toBeNull();
    });
  });

  describe('findAllByTicket', () => {
    it('deve retornar o histórico de auditoria para o técnico responsável', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(mockTicket);
      mockPrismaService.audit.findMany.mockResolvedValue([mockAudit]);

      const result = await service.findAllByTicket(mockTicket.id, mockTech);

      expect(prismaService.ticket.findUnique).toHaveBeenCalledWith({
        where: { id: mockTicket.id },
      });
      expect(prismaService.audit.findMany).toHaveBeenCalledWith({
        where: { ticketId: mockTicket.id },
        orderBy: { createdAt: 'asc' },
        include: expect.any(Object),
      });
      expect(result).toEqual([mockAudit]);
    });

    it('deve retornar o histórico de auditoria para o ADMIN', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(mockTicket);
      mockPrismaService.audit.findMany.mockResolvedValue([mockAudit]);

      const result = await service.findAllByTicket(mockTicket.id, mockAdmin);

      expect(result).toEqual([mockAudit]);
    });

    it('deve lançar NotFoundException se o chamado não for encontrado', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(null);

      await expect(
        service.findAllByTicket('ticket-inexistente', mockAdmin),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar ForbiddenException se o solicitante (USER) tentar consultar a auditoria', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(mockTicket);

      await expect(
        service.findAllByTicket(mockTicket.id, mockUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('deve lançar ForbiddenException se um técnico não responsável tentar consultar a auditoria', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(mockTicket);

      await expect(
        service.findAllByTicket(mockTicket.id, mockOtherTech),
      ).rejects.toThrow(ForbiddenException);
    });

    it('deve lançar ForbiddenException se um técnico consultar um chamado não atribuído', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue({
        ...mockTicket,
        assigneeId: null,
      });

      await expect(
        service.findAllByTicket(mockTicket.id, mockTech),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
