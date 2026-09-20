import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { Category } from '../generated/prisma/client';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let prismaService: PrismaService;

  const mockCategory: Category = {
    id: 'cat-uuid-1',
    name: 'Hardware',
    description: 'Problemas em equipamentos físicos',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    category: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar uma categoria com sucesso', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(null);
      mockPrismaService.category.create.mockResolvedValue(mockCategory);

      const dto = {
        name: 'Hardware',
        description: 'Problemas em equipamentos físicos',
      };
      const result = await service.create(dto);

      expect(prismaService.category.findUnique).toHaveBeenCalledWith({
        where: { name: 'Hardware' },
      });
      expect(prismaService.category.create).toHaveBeenCalledWith({
        data: {
          name: 'Hardware',
          description: 'Problemas em equipamentos físicos',
          active: true,
        },
      });
      expect(result).toEqual(mockCategory);
    });

    it('deve lançar ConflictException se o nome da categoria já existir', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);

      const dto = { name: 'Hardware' };

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
      expect(prismaService.category.create).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('deve retornar apenas categorias ativas por padrão', async () => {
      mockPrismaService.category.findMany.mockResolvedValue([mockCategory]);

      const result = await service.findAll();

      expect(prismaService.category.findMany).toHaveBeenCalledWith({
        where: { active: true },
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual([mockCategory]);
    });

    it('deve retornar todas as categorias (ativas e inativas) quando includeInactive for true', async () => {
      const inactiveCategory = { ...mockCategory, id: 'cat-2', active: false };
      mockPrismaService.category.findMany.mockResolvedValue([
        mockCategory,
        inactiveCategory,
      ]);

      const result = await service.findAll(true);

      expect(prismaService.category.findMany).toHaveBeenCalledWith({
        where: undefined,
        orderBy: { name: 'asc' },
      });
      expect(result).toHaveLength(2);
    });
  });

  describe('findById', () => {
    it('deve retornar a categoria se for encontrada por ID', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);

      const result = await service.findById(mockCategory.id);

      expect(prismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: mockCategory.id },
      });
      expect(result).toEqual(mockCategory);
    });

    it('deve lançar NotFoundException se a categoria não for encontrada', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(service.findById('inexistente')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('deve atualizar a categoria com sucesso', async () => {
      const updatedCategory = { ...mockCategory, name: 'Hardware & TI' };
      mockPrismaService.category.findUnique
        .mockResolvedValueOnce(mockCategory) // Checagem findById
        .mockResolvedValueOnce(null); // Checagem de nome único
      mockPrismaService.category.update.mockResolvedValue(updatedCategory);

      const dto = { name: 'Hardware & TI' };
      const result = await service.update(mockCategory.id, dto);

      expect(prismaService.category.update).toHaveBeenCalledWith({
        where: { id: mockCategory.id },
        data: {
          name: 'Hardware & TI',
          description: undefined,
          active: undefined,
        },
      });
      expect(result).toEqual(updatedCategory);
    });

    it('deve lançar ConflictException se o novo nome já estiver em uso por outra categoria', async () => {
      const existingOther = { ...mockCategory, id: 'cat-outra', name: 'Rede' };
      mockPrismaService.category.findUnique
        .mockResolvedValueOnce(mockCategory) // Checagem findById
        .mockResolvedValueOnce(existingOther); // Checagem de nome único

      const dto = { name: 'Rede' };

      await expect(service.update(mockCategory.id, dto)).rejects.toThrow(
        ConflictException,
      );
      expect(prismaService.category.update).not.toHaveBeenCalled();
    });

    it('deve lançar NotFoundException se a categoria não existir', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(
        service.update('inexistente', { name: 'Novo Nome' }),
      ).rejects.toThrow(NotFoundException);
      expect(prismaService.category.update).not.toHaveBeenCalled();
    });
  });

  describe('deactivate', () => {
    it('deve desativar logicamente a categoria', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.category.update.mockResolvedValue({
        ...mockCategory,
        active: false,
      });

      await service.deactivate(mockCategory.id);

      expect(prismaService.category.update).toHaveBeenCalledWith({
        where: { id: mockCategory.id },
        data: { active: false },
      });
    });

    it('deve lançar NotFoundException se tentar desativar categoria inexistente', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(service.deactivate('inexistente')).rejects.toThrow(
        NotFoundException,
      );
      expect(prismaService.category.update).not.toHaveBeenCalled();
    });
  });
});
