import { BadRequestException, ForbiddenException, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticatedUser } from '../auth/jwt.strategy';
import { TicketPriority, TicketStatus, UserRole } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { TicketsService } from './tickets.service';

describe('TicketsService', () => {
  let service: TicketsService;
  let prismaService: PrismaService;

  const mockCategory = {
    id: 'cat-uuid-1',
    name: 'Hardware',
    description: 'Problemas de hardware',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

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

  const mockAdmin: AuthenticatedUser = {
    id: 'admin-uuid-1',
    email: 'admin@test.com',
    role: UserRole.ADMIN,
  };

  const mockTicket = {
    id: 'ticket-uuid-1',
    title: 'Monitor sem vídeo',
    description: 'O monitor não liga',
    status: TicketStatus.OPEN,
    priority: TicketPriority.MEDIUM,
    requesterId: mockUser.id,
    assigneeId: null,
    categoryId: mockCategory.id,
    createdAt: new Date(),
    updatedAt: new Date(),
    resolvedAt: null,
    closedAt: null,
    category: mockCategory,
    requester: {
      id: mockUser.id,
      name: 'User Test',
      email: mockUser.email,
      role: UserRole.USER,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    assignee: null,
  };

  const mockPrismaService = {
    category: {
      findUnique: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
    systemSettings: {
      findFirst: jest.fn(),
    },
    ticket: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<TicketsService>(TicketsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateStateTransition', () => {
    it('deve permitir transições de estado válidas', () => {
      expect(() => service.validateStateTransition(TicketStatus.OPEN, TicketStatus.IN_PROGRESS)).not.toThrow();
      expect(() => service.validateStateTransition(TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED)).not.toThrow();
      expect(() => service.validateStateTransition(TicketStatus.RESOLVED, TicketStatus.CLOSED)).not.toThrow();
    });

    it('deve lançar UnprocessableEntityException para transições de estado inválidas', () => {
      expect(() => service.validateStateTransition(TicketStatus.OPEN, TicketStatus.CLOSED)).toThrow(UnprocessableEntityException);
      expect(() => service.validateStateTransition(TicketStatus.IN_PROGRESS, TicketStatus.CLOSED)).toThrow(UnprocessableEntityException);
    });
  });

  describe('create', () => {
    it('deve criar um chamado com sucesso quando a categoria for válida e ativa', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.ticket.create.mockResolvedValue(mockTicket);

      const dto = {
        title: 'Monitor sem vídeo',
        description: 'O monitor não liga',
        categoryId: mockCategory.id,
      };

      const result = await service.create(mockUser.id, dto);

      expect(prismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: mockCategory.id },
      });
      expect(prismaService.ticket.create).toHaveBeenCalledWith({
        data: {
          title: dto.title,
          description: dto.description,
          priority: TicketPriority.MEDIUM,
          status: TicketStatus.OPEN,
          requesterId: mockUser.id,
          categoryId: dto.categoryId,
        },
        include: expect.any(Object),
      });
      expect(result).toEqual(mockTicket);
    });

    it('deve lançar BadRequestException se a categoria não existir', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      const dto = {
        title: 'Monitor sem vídeo',
        description: 'O monitor não liga',
        categoryId: 'cat-invalida',
      };

      await expect(service.create(mockUser.id, dto)).rejects.toThrow(BadRequestException);
      expect(prismaService.ticket.create).not.toHaveBeenCalled();
    });

    it('deve lançar BadRequestException se a categoria estiver inativa', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue({
        ...mockCategory,
        active: false,
      });

      const dto = {
        title: 'Monitor sem vídeo',
        description: 'O monitor não liga',
        categoryId: mockCategory.id,
      };

      await expect(service.create(mockUser.id, dto)).rejects.toThrow(BadRequestException);
      expect(prismaService.ticket.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('deve filtrar chamados pelo requesterId quando o papel for USER', async () => {
      mockPrismaService.ticket.findMany.mockResolvedValue([mockTicket]);
      mockPrismaService.ticket.count.mockResolvedValue(1);

      const result = await service.findAll(mockUser, {});

      expect(prismaService.ticket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ requesterId: mockUser.id }),
          skip: 0,
          take: 10,
        }),
      );
      expect(result.data).toEqual([mockTicket]);
      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('deve incluir chamados sem responsável, atribuídos e solicitados quando o papel for TECHNICIAN', async () => {
      mockPrismaService.ticket.findMany.mockResolvedValue([mockTicket]);
      mockPrismaService.ticket.count.mockResolvedValue(1);

      await service.findAll(mockTech, {});

      expect(prismaService.ticket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { assigneeId: null },
              { assigneeId: mockTech.id },
              { requesterId: mockTech.id },
            ],
          }),
        }),
      );
    });

    it('deve retornar todos os chamados quando o papel for ADMIN', async () => {
      mockPrismaService.ticket.findMany.mockResolvedValue([mockTicket]);
      mockPrismaService.ticket.count.mockResolvedValue(1);

      await service.findAll(mockAdmin, {});

      expect(prismaService.ticket.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
        }),
      );
    });
  });

  describe('findById', () => {
    it('deve retornar o chamado se o usuário for o solicitante (USER)', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(mockTicket);

      const result = await service.findById(mockTicket.id, mockUser);

      expect(result).toEqual(mockTicket);
    });

    it('deve lançar ForbiddenException se o usuário (USER) tentar acessar chamado de outro solicitante', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(mockTicket);
      const otherUser: AuthenticatedUser = {
        id: 'user-uuid-outro',
        email: 'outro@test.com',
        role: UserRole.USER,
      };

      await expect(service.findById(mockTicket.id, otherUser)).rejects.toThrow(ForbiddenException);
    });

    it('deve permitir acesso do ADMIN a qualquer chamado', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(mockTicket);

      const result = await service.findById(mockTicket.id, mockAdmin);

      expect(result).toEqual(mockTicket);
    });

    it('deve lançar NotFoundException se o chamado não for encontrado', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(null);

      await expect(service.findById('ticket-inexistente', mockUser)).rejects.toThrow(NotFoundException);
    });
  });

  describe('assign', () => {
    it('deve permitir que o técnico assuma um chamado sem responsável', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(mockTicket);
      mockPrismaService.systemSettings.findFirst.mockResolvedValue({ allowTechnicianSelfAssignment: true });
      mockPrismaService.user.findUnique.mockResolvedValue({ id: mockTech.id, active: true, role: UserRole.TECHNICIAN });
      const assignedTicket = { ...mockTicket, assigneeId: mockTech.id, status: TicketStatus.IN_PROGRESS };
      mockPrismaService.ticket.update.mockResolvedValue(assignedTicket);

      const result = await service.assign(mockTicket.id, mockTech);

      expect(prismaService.ticket.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockTicket.id },
          data: { assigneeId: mockTech.id, status: TicketStatus.IN_PROGRESS },
        }),
      );
      expect(result).toEqual(assignedTicket);
    });

    it('deve lançar ForbiddenException se a autoatribuição estiver desabilitada em SystemSettings', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(mockTicket);
      mockPrismaService.systemSettings.findFirst.mockResolvedValue({ allowTechnicianSelfAssignment: false });

      await expect(service.assign(mockTicket.id, mockTech)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('reassign', () => {
    it('deve permitir que o ADMIN reatribua um chamado a outro técnico', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(mockTicket);
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 'other-tech', active: true, role: UserRole.TECHNICIAN });
      const reassignedTicket = { ...mockTicket, assigneeId: 'other-tech', status: TicketStatus.IN_PROGRESS };
      mockPrismaService.ticket.update.mockResolvedValue(reassignedTicket);

      const result = await service.reassign(mockTicket.id, mockAdmin, { assigneeId: 'other-tech' });

      expect(prismaService.ticket.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockTicket.id },
          data: { assigneeId: 'other-tech', status: TicketStatus.IN_PROGRESS },
        }),
      );
      expect(result).toEqual(reassignedTicket);
    });

    it('deve lançar ForbiddenException se um não-ADMIN tentar reatribuir', async () => {
      await expect(service.reassign(mockTicket.id, mockTech, { assigneeId: 'other-tech' })).rejects.toThrow(ForbiddenException);
    });
  });
});
