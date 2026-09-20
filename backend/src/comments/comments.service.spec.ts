import { ForbiddenException, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthenticatedUser } from '../auth/jwt.strategy';
import { TicketPriority, TicketStatus, UserRole } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CommentsService } from './comments.service';

describe('CommentsService', () => {
  let service: CommentsService;
  let prismaService: PrismaService;

  const mockUser: AuthenticatedUser = {
    id: 'user-uuid-1',
    email: 'user@test.com',
    role: UserRole.USER,
  };

  const mockOtherUser: AuthenticatedUser = {
    id: 'user-uuid-2',
    email: 'other@test.com',
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
    title: 'Monitor sem vídeo',
    description: 'O monitor não liga',
    status: TicketStatus.IN_PROGRESS,
    priority: TicketPriority.MEDIUM,
    requesterId: mockUser.id,
    assigneeId: mockTech.id,
    categoryId: 'cat-1',
    createdAt: new Date(),
    updatedAt: new Date(),
    resolvedAt: null,
    closedAt: null,
  };

  const mockComment = {
    id: 'comment-uuid-1',
    content: 'Cabo de força testado, sem resposta.',
    ticketId: mockTicket.id,
    authorId: mockUser.id,
    createdAt: new Date(),
    author: {
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
    comment: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar um comentário com sucesso quando o autor for o solicitante do chamado', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(mockTicket);
      mockPrismaService.comment.create.mockResolvedValue(mockComment);

      const dto = { content: 'Cabo de força testado, sem resposta.' };
      const result = await service.create(mockTicket.id, mockUser, dto);

      expect(prismaService.ticket.findUnique).toHaveBeenCalledWith({
        where: { id: mockTicket.id },
      });
      expect(prismaService.comment.create).toHaveBeenCalledWith({
        data: {
          content: dto.content,
          ticketId: mockTicket.id,
          authorId: mockUser.id,
        },
        include: expect.any(Object),
      });
      expect(result).toEqual(mockComment);
    });

    it('deve criar um comentário com sucesso quando o autor for o técnico responsável', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(mockTicket);
      mockPrismaService.comment.create.mockResolvedValue({
        ...mockComment,
        authorId: mockTech.id,
      });

      const dto = { content: 'Irei ao local averiguar o equipamento.' };
      const result = await service.create(mockTicket.id, mockTech, dto);

      expect(result.authorId).toEqual(mockTech.id);
    });

    it('deve criar um comentário com sucesso quando o autor for ADMIN', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(mockTicket);
      mockPrismaService.comment.create.mockResolvedValue({
        ...mockComment,
        authorId: mockAdmin.id,
      });

      const dto = { content: 'Comentário administrativo.' };
      const result = await service.create(mockTicket.id, mockAdmin, dto);

      expect(result.authorId).toEqual(mockAdmin.id);
    });

    it('deve lançar NotFoundException se o chamado não for encontrado', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(null);

      await expect(
        service.create('ticket-inexistente', mockUser, { content: 'Teste' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar UnprocessableEntityException se o chamado estiver ENCERRADO (CLOSED)', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue({
        ...mockTicket,
        status: TicketStatus.CLOSED,
      });

      await expect(
        service.create(mockTicket.id, mockUser, { content: 'Teste' }),
      ).rejects.toThrow(UnprocessableEntityException);
    });

    it('deve lançar ForbiddenException se um USER não-solicitante tentar comentar', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(mockTicket);

      await expect(
        service.create(mockTicket.id, mockOtherUser, { content: 'Teste' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('deve lançar ForbiddenException se um TECHNICIAN não-atribuído tentar comentar', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(mockTicket);

      await expect(
        service.create(mockTicket.id, mockOtherTech, { content: 'Teste' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findAllByTicket', () => {
    it('deve retornar comentários ordenados para o solicitante do chamado', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(mockTicket);
      mockPrismaService.comment.findMany.mockResolvedValue([mockComment]);

      const result = await service.findAllByTicket(mockTicket.id, mockUser);

      expect(prismaService.comment.findMany).toHaveBeenCalledWith({
        where: { ticketId: mockTicket.id },
        orderBy: { createdAt: 'asc' },
        include: expect.any(Object),
      });
      expect(result).toEqual([mockComment]);
    });

    it('deve permitir acesso a comentários para o técnico responsável', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(mockTicket);
      mockPrismaService.comment.findMany.mockResolvedValue([mockComment]);

      const result = await service.findAllByTicket(mockTicket.id, mockTech);

      expect(result).toEqual([mockComment]);
    });

    it('deve permitir acesso a comentários para o ADMIN', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(mockTicket);
      mockPrismaService.comment.findMany.mockResolvedValue([mockComment]);

      const result = await service.findAllByTicket(mockTicket.id, mockAdmin);

      expect(result).toEqual([mockComment]);
    });

    it('deve permitir acesso a comentários para técnicos em chamados não atribuídos', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue({
        ...mockTicket,
        assigneeId: null,
      });
      mockPrismaService.comment.findMany.mockResolvedValue([mockComment]);

      const result = await service.findAllByTicket(mockTicket.id, mockOtherTech);

      expect(result).toEqual([mockComment]);
    });

    it('deve lançar NotFoundException se o chamado não for encontrado', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(null);

      await expect(
        service.findAllByTicket('ticket-inexistente', mockUser),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar ForbiddenException se outro USER tentar visualizar comentários', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(mockTicket);

      await expect(
        service.findAllByTicket(mockTicket.id, mockOtherUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it('deve lançar ForbiddenException se outro TECHNICIAN tentar visualizar chamado atribuído a terceiro', async () => {
      mockPrismaService.ticket.findUnique.mockResolvedValue(mockTicket);

      await expect(
        service.findAllByTicket(mockTicket.id, mockOtherTech),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
