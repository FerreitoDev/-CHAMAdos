import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '../generated/prisma/client';
import { NotFoundException } from '@nestjs/common';
import * as argon2 from 'argon2';

jest.mock('argon2');

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: PrismaService;

  const mockUser = {
    id: 'user-uuid-1',
    name: 'Fulano',
    email: 'fulano@exemplo.com',
    passwordHash: 'hashedpassword123',
    role: UserRole.USER,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const expectedSafeUser = {
    id: mockUser.id,
    name: mockUser.name,
    email: mockUser.email,
    role: mockUser.role,
    active: mockUser.active,
    createdAt: mockUser.createdAt,
    updatedAt: mockUser.updatedAt,
  };

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByEmail', () => {
    it('deve retornar o usuário com hash quando for encontrado', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findByEmail('fulano@exemplo.com');

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'fulano@exemplo.com' },
      });
      expect(result).toEqual(mockUser);
    });

    it('deve retornar null se o usuário não for encontrado', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.findByEmail('inexistente@exemplo.com');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('deve criar um usuário, fazer hash da senha e retornar versão omitindo passwordHash', async () => {
      (argon2.hash as jest.Mock).mockResolvedValue('hashed-super-secure');
      mockPrismaService.user.create.mockResolvedValue({
        ...mockUser,
        passwordHash: 'hashed-super-secure',
      });

      const result = await service.create({
        name: 'Fulano',
        email: 'fulano@exemplo.com',
        password: 'plain-password',
        role: UserRole.USER,
      });

      expect(argon2.hash).toHaveBeenCalledWith('plain-password');
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          name: 'Fulano',
          email: 'fulano@exemplo.com',
          passwordHash: 'hashed-super-secure',
          role: UserRole.USER,
          active: true,
        },
      });

      expect(result).toEqual(expectedSafeUser);
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('deve criar um usuário omitindo role (deixando undefined para default do schema)', async () => {
      (argon2.hash as jest.Mock).mockResolvedValue('hashed-super-secure');
      mockPrismaService.user.create.mockResolvedValue({
        ...mockUser,
        role: UserRole.USER,
      });

      const result = await service.create({
        name: 'Fulano',
        email: 'fulano@exemplo.com',
        password: 'plain-password',
      });

      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          name: 'Fulano',
          email: 'fulano@exemplo.com',
          passwordHash: 'hashed-super-secure',
          role: undefined,
          active: true,
        },
      });
      expect(result).toEqual(expectedSafeUser);
    });
  });

  describe('findAll', () => {
    it('deve retornar a lista de usuários segura (sem hash)', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([mockUser]);

      const result = await service.findAll();

      expect(prismaService.user.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual([expectedSafeUser]);
    });

    it('deve retornar lista vazia quando não existirem usuários cadastrados', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findById', () => {
    it('deve retornar o usuário de forma segura se encontrado', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findById(mockUser.id);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(result).toEqual(expectedSafeUser);
    });

    it('deve lançar NotFoundException se não encontrado', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findById('qualquer-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('deve atualizar o usuário e retornar a versão segura', async () => {
      const updatedUser = { ...mockUser, name: 'Ciclano', role: UserRole.ADMIN };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser); // Retorna na checagem do findById
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update(mockUser.id, { name: 'Ciclano', role: UserRole.ADMIN });

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { name: 'Ciclano', role: UserRole.ADMIN },
      });
      expect(result).toEqual({ ...expectedSafeUser, name: 'Ciclano', role: UserRole.ADMIN });
    });

    it('deve atualizar apenas o nome do usuário', async () => {
      const updatedUser = { ...mockUser, name: 'Ciclano Apenas' };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update(mockUser.id, { name: 'Ciclano Apenas' });

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { name: 'Ciclano Apenas', role: undefined },
      });
      expect(result).toEqual({ ...expectedSafeUser, name: 'Ciclano Apenas' });
    });

    it('deve atualizar apenas o role do usuário', async () => {
      const updatedUser = { ...mockUser, role: UserRole.TECHNICIAN };
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.update(mockUser.id, { role: UserRole.TECHNICIAN });

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { name: undefined, role: UserRole.TECHNICIAN },
      });
      expect(result).toEqual({ ...expectedSafeUser, role: UserRole.TECHNICIAN });
    });

    it('deve lançar NotFoundException e não atualizar se não existir', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.update('fake-id', { name: 'teste' })).rejects.toThrow(NotFoundException);
      expect(prismaService.user.update).not.toHaveBeenCalled();
    });
  });

  describe('deactivate', () => {
    it('deve desativar logicamente o usuário', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({ ...mockUser, active: false });

      await service.deactivate(mockUser.id);

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { active: false },
      });
    });

    it('deve lançar NotFoundException ao tentar desativar se não existir', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.deactivate('fake-id')).rejects.toThrow(NotFoundException);
      expect(prismaService.user.update).not.toHaveBeenCalled();
    });
  });
});

