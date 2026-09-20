import { Test, TestingModule } from '@nestjs/testing';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { TicketPriority, TicketStatus, UserRole } from '../generated/prisma/client';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { PaginatedTicketsResponse, SafeTicket } from './tickets.types';

describe('TicketsController', () => {
  let controller: TicketsController;
  let service: TicketsService;

  const mockUser: AuthenticatedUser = {
    id: 'user-uuid-1',
    email: 'user@test.com',
    role: UserRole.USER,
  };

  const mockTicket: SafeTicket = {
    id: 'ticket-uuid-1',
    title: 'Erro no sistema',
    description: 'Não consigo acessar o sistema',
    status: TicketStatus.OPEN,
    priority: TicketPriority.MEDIUM,
    requesterId: mockUser.id,
    assigneeId: null,
    categoryId: 'cat-uuid-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    resolvedAt: null,
    closedAt: null,
    category: {
      id: 'cat-uuid-1',
      name: 'Software',
      description: 'Sistemas',
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
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

  const mockPaginatedResponse: PaginatedTicketsResponse = {
    data: [mockTicket],
    meta: {
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    },
  };

  const mockTicketsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    assign: jest.fn(),
    reassign: jest.fn(),
    resolve: jest.fn(),
    close: jest.fn(),
    reopen: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TicketsController],
      providers: [
        {
          provide: TicketsService,
          useValue: mockTicketsService,
        },
      ],
    }).compile();

    controller = module.get<TicketsController>(TicketsController);
    service = module.get<TicketsService>(TicketsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('deve chamar service.create com o id do usuário logado e o dto', async () => {
      const dto = {
        title: 'Erro no sistema',
        description: 'Não consigo acessar o sistema',
        categoryId: 'cat-uuid-1',
      };
      mockTicketsService.create.mockResolvedValue(mockTicket);

      const result = await controller.create(mockUser, dto);

      expect(service.create).toHaveBeenCalledWith(mockUser.id, dto);
      expect(result).toEqual(mockTicket);
    });
  });

  describe('findAll', () => {
    it('deve chamar service.findAll com o usuário logado e os filtros de busca', async () => {
      const query = { page: 1, limit: 10 };
      mockTicketsService.findAll.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.findAll(mockUser, query);

      expect(service.findAll).toHaveBeenCalledWith(mockUser, query);
      expect(result).toEqual(mockPaginatedResponse);
    });
  });

  describe('findById', () => {
    it('deve chamar service.findById com o ID do chamado e o usuário logado', async () => {
      mockTicketsService.findById.mockResolvedValue(mockTicket);

      const result = await controller.findById(mockTicket.id, mockUser);

      expect(service.findById).toHaveBeenCalledWith(mockTicket.id, mockUser);
      expect(result).toEqual(mockTicket);
    });
  });

  describe('assign', () => {
    it('deve chamar service.assign com o ID do chamado, usuário logado e DTO opcional', async () => {
      const assignedTicket = { ...mockTicket, status: TicketStatus.IN_PROGRESS, assigneeId: 'tech-uuid-1' };
      mockTicketsService.assign.mockResolvedValue(assignedTicket);
      const dto = { assigneeId: 'tech-uuid-1' };

      const result = await controller.assign(mockTicket.id, mockUser, dto);

      expect(service.assign).toHaveBeenCalledWith(mockTicket.id, mockUser, dto);
      expect(result).toEqual(assignedTicket);
    });
  });

  describe('reassign', () => {
    it('deve chamar service.reassign com o ID do chamado, usuário logado e DTO', async () => {
      const reassignedTicket = { ...mockTicket, status: TicketStatus.IN_PROGRESS, assigneeId: 'other-tech-id' };
      mockTicketsService.reassign.mockResolvedValue(reassignedTicket);
      const dto = { assigneeId: 'other-tech-id' };

      const result = await controller.reassign(mockTicket.id, mockUser, dto);

      expect(service.reassign).toHaveBeenCalledWith(mockTicket.id, mockUser, dto);
      expect(result).toEqual(reassignedTicket);
    });
  });

  describe('resolve', () => {
    it('deve chamar service.resolve com o ID do chamado, usuário logado e DTO opcional', async () => {
      const resolvedTicket = { ...mockTicket, status: TicketStatus.RESOLVED, resolvedAt: new Date() };
      mockTicketsService.resolve.mockResolvedValue(resolvedTicket);
      const dto = { solutionNotes: 'Problema corrigido' };

      const result = await controller.resolve(mockTicket.id, mockUser, dto);

      expect(service.resolve).toHaveBeenCalledWith(mockTicket.id, mockUser, dto);
      expect(result).toEqual(resolvedTicket);
    });
  });

  describe('close', () => {
    it('deve chamar service.close com o ID do chamado e o usuário logado', async () => {
      const closedTicket = { ...mockTicket, status: TicketStatus.CLOSED, closedAt: new Date() };
      mockTicketsService.close.mockResolvedValue(closedTicket);

      const result = await controller.close(mockTicket.id, mockUser);

      expect(service.close).toHaveBeenCalledWith(mockTicket.id, mockUser);
      expect(result).toEqual(closedTicket);
    });
  });

  describe('reopen', () => {
    it('deve chamar service.reopen com o ID do chamado, usuário logado e DTO opcional', async () => {
      const reopenedTicket = { ...mockTicket, status: TicketStatus.OPEN };
      mockTicketsService.reopen.mockResolvedValue(reopenedTicket);
      const dto = { reopenReason: 'Ainda apresenta falha' };

      const result = await controller.reopen(mockTicket.id, mockUser, dto);

      expect(service.reopen).toHaveBeenCalledWith(mockTicket.id, mockUser, dto);
      expect(result).toEqual(reopenedTicket);
    });
  });
});
