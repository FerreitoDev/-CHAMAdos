import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Category } from '../generated/prisma/client';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCategoryDto): Promise<Category> {
    const existing = await this.prisma.category.findUnique({
      where: { name: dto.name },
    });

    if (existing) {
      throw new ConflictException('Categoria com este nome já existe');
    }

    return this.prisma.category.create({
      data: {
        name: dto.name,
        description: dto.description,
        active: true,
      },
    });
  }

  async findAll(includeInactive = false): Promise<Category[]> {
    return this.prisma.category.findMany({
      where: includeInactive ? undefined : { active: true },
      orderBy: { name: 'asc' },
    });
  }

  async findById(id: string): Promise<Category> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada');
    }

    return category;
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<Category> {
    const current = await this.findById(id);

    if (dto.name && dto.name !== current.name) {
      const existingWithSameName = await this.prisma.category.findUnique({
        where: { name: dto.name },
      });

      if (existingWithSameName) {
        throw new ConflictException('Categoria com este nome já existe');
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        active: dto.active,
      },
    });
  }

  async deactivate(id: string): Promise<void> {
    await this.findById(id);

    await this.prisma.category.update({
      where: { id },
      data: { active: false },
    });
  }
}
