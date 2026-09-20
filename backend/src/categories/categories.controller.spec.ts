import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { Category, UserRole } from '../generated/prisma/client';
import type { AuthenticatedUser } from '../auth/jwt.strategy';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: CategoriesService;

  const mockCategory: Category = {
    id: 'cat-uuid-1',
    name: 'Hardware',
    description: 'Equipamentos físicos',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const adminUser: AuthenticatedUser = {
    id: 'admin-1',
    email: 'admin@exemplo.com',
    role: UserRole.ADMIN,
  };

  const commonUser: AuthenticatedUser = {
    id: 'user-1',
    email: 'user@exemplo.com',
    role: UserRole.USER,
  };

  const mockCategoriesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    deactivate: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    service = module.get<CategoriesService>(CategoriesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('deve chamar service.create e retornar a nova categoria', async () => {
      const dto = { name: 'Hardware', description: 'Equipamentos' };
      mockCategoriesService.create.mockResolvedValue(mockCategory);

      const result = await controller.create(dto);

      expect(service.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockCategory);
    });
  });

  describe('findAll', () => {
    it('deve chamar service.findAll(false) por padrão para usuário comum', async () => {
      mockCategoriesService.findAll.mockResolvedValue([mockCategory]);

      const result = await controller.findAll(undefined, commonUser);

      expect(service.findAll).toHaveBeenCalledWith(false);
      expect(result).toEqual([mockCategory]);
    });

    it('deve chamar service.findAll(true) quando o ADMIN solicitar includeInactive=true', async () => {
      mockCategoriesService.findAll.mockResolvedValue([mockCategory]);

      const result = await controller.findAll('true', adminUser);

      expect(service.findAll).toHaveBeenCalledWith(true);
      expect(result).toEqual([mockCategory]);
    });

    it('deve chamar service.findAll(false) quando usuário não-ADMIN tentar passar includeInactive=true', async () => {
      mockCategoriesService.findAll.mockResolvedValue([mockCategory]);

      const result = await controller.findAll('true', commonUser);

      expect(service.findAll).toHaveBeenCalledWith(false);
      expect(result).toEqual([mockCategory]);
    });
  });

  describe('findById', () => {
    it('deve chamar service.findById e retornar a categoria', async () => {
      mockCategoriesService.findById.mockResolvedValue(mockCategory);

      const result = await controller.findById(mockCategory.id);

      expect(service.findById).toHaveBeenCalledWith(mockCategory.id);
      expect(result).toEqual(mockCategory);
    });
  });

  describe('update', () => {
    it('deve chamar service.update e retornar a categoria atualizada', async () => {
      const dto = { name: 'Hardware Editado' };
      const updated = { ...mockCategory, name: 'Hardware Editado' };
      mockCategoriesService.update.mockResolvedValue(updated);

      const result = await controller.update(mockCategory.id, dto);

      expect(service.update).toHaveBeenCalledWith(mockCategory.id, dto);
      expect(result).toEqual(updated);
    });
  });

  describe('deactivate', () => {
    it('deve chamar service.deactivate com o ID correto', async () => {
      mockCategoriesService.deactivate.mockResolvedValue(undefined);

      await controller.deactivate(mockCategory.id);

      expect(service.deactivate).toHaveBeenCalledWith(mockCategory.id);
    });
  });
});
