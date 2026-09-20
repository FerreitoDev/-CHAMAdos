import { Test, TestingModule } from '@nestjs/testing';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { UserRole } from '../generated/prisma/client';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { SafeComment } from './comments.types';
import { CreateCommentDto } from './dto/create-comment.dto';

describe('CommentsController', () => {
  let controller: CommentsController;
  let service: CommentsService;

  const mockUser: AuthenticatedUser = {
    id: 'user-uuid-1',
    email: 'user@test.com',
    role: UserRole.USER,
  };

  const mockComment: SafeComment = {
    id: 'comment-uuid-1',
    content: 'Problema persiste após reiniciar.',
    ticketId: 'ticket-uuid-1',
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

  const mockCommentsService = {
    create: jest.fn(),
    findAllByTicket: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        {
          provide: CommentsService,
          useValue: mockCommentsService,
        },
      ],
    }).compile();

    controller = module.get<CommentsController>(CommentsController);
    service = module.get<CommentsService>(CommentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('deve chamar service.create com ticketId, usuário logado e dto', async () => {
      const dto: CreateCommentDto = { content: 'Problema persiste após reiniciar.' };
      mockCommentsService.create.mockResolvedValue(mockComment);

      const result = await controller.create('ticket-uuid-1', mockUser, dto);

      expect(service.create).toHaveBeenCalledWith('ticket-uuid-1', mockUser, dto);
      expect(result).toEqual(mockComment);
    });
  });

  describe('findAllByTicket', () => {
    it('deve chamar service.findAllByTicket com ticketId e usuário logado', async () => {
      mockCommentsService.findAllByTicket.mockResolvedValue([mockComment]);

      const result = await controller.findAllByTicket('ticket-uuid-1', mockUser);

      expect(service.findAllByTicket).toHaveBeenCalledWith('ticket-uuid-1', mockUser);
      expect(result).toEqual([mockComment]);
    });
  });
});
