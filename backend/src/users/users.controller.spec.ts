import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRole } from '../generated/prisma/client';
import { ForbiddenException, BadRequestException } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { SafeUser } from './users.types';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockSafeUser: SafeUser = {
    id: 'user-uuid-1',
    name: 'Fulano',
    email: 'fulano@exemplo.com',
    role: UserRole.USER,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const adminUser: AuthenticatedUser = {
    id: 'admin-uuid-1',
    email: 'admin@exemplo.com',
    role: UserRole.ADMIN,
  };

  const commonUser: AuthenticatedUser = {
    id: 'user-uuid-1',
    email: 'fulano@exemplo.com',
    role: UserRole.USER,
  };

  const otherUser: AuthenticatedUser = {
    id: 'user-uuid-2',
    email: 'outro@exemplo.com',
    role: UserRole.USER,
  };

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    deactivate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('deve chamar usersService.create e retornar o usuário criado', async () => {
      const dto = {
        name: 'Fulano',
        email: 'fulano@exemplo.com',
        password: 'password123',
        role: UserRole.USER,
      };
      mockUsersService.create.mockResolvedValue(mockSafeUser);

      const result = await controller.create(dto);

      expect(usersService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockSafeUser);
    });
  });

  describe('findAll', () => {
    it('deve chamar usersService.findAll e retornar a lista de usuários', async () => {
      mockUsersService.findAll.mockResolvedValue([mockSafeUser]);

      const result = await controller.findAll();

      expect(usersService.findAll).toHaveBeenCalled();
      expect(result).toEqual([mockSafeUser]);
    });
  });

  describe('findById', () => {
    it('deve permitir que o próprio usuário consulte seu perfil', async () => {
      mockUsersService.findById.mockResolvedValue(mockSafeUser);

      const result = await controller.findById(commonUser.id, commonUser);

      expect(usersService.findById).toHaveBeenCalledWith(commonUser.id);
      expect(result).toEqual(mockSafeUser);
    });

    it('deve permitir que um ADMIN consulte o perfil de qualquer usuário', async () => {
      mockUsersService.findById.mockResolvedValue(mockSafeUser);

      const result = await controller.findById(commonUser.id, adminUser);

      expect(usersService.findById).toHaveBeenCalledWith(commonUser.id);
      expect(result).toEqual(mockSafeUser);
    });

    it('deve negar acesso (403 Forbidden) quando um usuário não-ADMIN tenta acessar outro perfil', async () => {
      await expect(
        controller.findById(mockSafeUser.id, otherUser),
      ).rejects.toThrow(ForbiddenException);

      expect(usersService.findById).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('deve chamar usersService.update e retornar o usuário atualizado', async () => {
      const dto = { name: 'Fulano Atualizado' };
      const updatedUser = { ...mockSafeUser, name: 'Fulano Atualizado' };
      mockUsersService.update.mockResolvedValue(updatedUser);

      const result = await controller.update(mockSafeUser.id, dto);

      expect(usersService.update).toHaveBeenCalledWith(mockSafeUser.id, dto);
      expect(result).toEqual(updatedUser);
    });
  });

  describe('deactivate', () => {
    it('deve permitir que um ADMIN desative a conta de outro usuário', async () => {
      mockUsersService.deactivate.mockResolvedValue(undefined);

      await controller.deactivate(commonUser.id, adminUser);

      expect(usersService.deactivate).toHaveBeenCalledWith(commonUser.id);
    });

    it('deve impedir que o ADMIN desative a própria conta (400 Bad Request)', async () => {
      await expect(
        controller.deactivate(adminUser.id, adminUser),
      ).rejects.toThrow(BadRequestException);

      expect(usersService.deactivate).not.toHaveBeenCalled();
    });
  });
});

