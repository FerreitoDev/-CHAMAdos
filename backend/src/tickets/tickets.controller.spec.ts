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
});
