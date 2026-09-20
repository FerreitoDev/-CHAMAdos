import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '../generated/prisma/client';
import { SafeUser } from './users.types';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    private toSafeUser(user: User): SafeUser {
        const { passwordHash, ...safeUser } = user;
        return safeUser;
    }

    // Usado internamente pela AuthStrategy (precisa da senha para verificação ou checar se existe)
    async findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async create(dto: CreateUserDto): Promise<SafeUser> {
        const passwordHash = await argon2.hash(dto.password);

        const user = await this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                passwordHash,
                role: dto.role,
                active: true,
            },
        });

        return this.toSafeUser(user);
    }

    async findAll(): Promise<SafeUser[]> {
        const users = await this.prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return users.map(this.toSafeUser);
    }

    async findById(id: string): Promise<SafeUser> {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            throw new NotFoundException(`Usuário não encontrado`);
        }

        return this.toSafeUser(user);
    }

    async update(id: string, dto: UpdateUserDto): Promise<SafeUser> {
        // Garantir que o usuário exista
        await this.findById(id);

        const user = await this.prisma.user.update({
            where: { id },
            data: {
                name: dto.name,
                role: dto.role,
            },
        });

        return this.toSafeUser(user);
    }

    async deactivate(id: string): Promise<void> {
        // Garantir que o usuário exista
        await this.findById(id);

        await this.prisma.user.update({
            where: { id },
            data: { active: false },
        });
    }
}