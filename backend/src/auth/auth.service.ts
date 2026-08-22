import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { User } from '../generated/prisma/client';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';

export type SafeUser = Omit<User, 'passwordHash'>;

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) { }

    async validateUser(email: string, password: string): Promise<SafeUser | null> {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
            return null;
        }

        // Bloquear autenticação de usuários inativos
        if (!user.active) {
            return null;
        }

        const isPasswordValid = await argon2.verify(user.passwordHash, password);
        if (!isPasswordValid) {
            return null;
        }

        // Retornar usuário sem o passwordHash (SafeUser)
        const { passwordHash, ...safeUser } = user;
        return safeUser;
    }

    async login(user: SafeUser): Promise<{ accessToken: string; rawRefreshToken: string }> {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };

        const accessToken = this.jwtService.sign(payload);

        // Gera o Refresh Token puro de forma criptograficamente segura
        const rawSecret = crypto.randomBytes(32).toString('hex');
        const tokenHash = await argon2.hash(rawSecret);

        // Salva o hash do Refresh Token no banco com validade de 7 dias
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias
        const tokenRecord = await this.prisma.refreshToken.create({
            data: {
                tokenHash,
                userId: user.id,
                expiresAt,
            },
        });

        // O token compartilhado com o cliente contém o ID do banco concatenado ao segredo
        // Isso permite busca indexada rápida (O(1)) no banco antes da verificação com argon2
        const rawRefreshToken = `${tokenRecord.id}.${rawSecret}`;

        return {
            accessToken,
            rawRefreshToken,
        };
    }

    async refresh(rawRefreshToken: string): Promise<{ accessToken: string }> {
        const parts = rawRefreshToken.split('.');
        if (parts.length !== 2) {
            throw new UnauthorizedException('Token de atualização inválido');
        }

        const [id, secret] = parts;

        const tokenRecord = await this.prisma.refreshToken.findUnique({
            where: { id },
            include: { user: true },
        });

        if (!tokenRecord) {
            throw new UnauthorizedException('Token de atualização não encontrado');
        }

        if (tokenRecord.expiresAt < new Date()) {
            throw new UnauthorizedException('Token de atualização expirado');
        }

        if (!tokenRecord.user.active) {
            throw new UnauthorizedException('Usuário associado está inativo');
        }

        const isTokenValid = await argon2.verify(tokenRecord.tokenHash, secret);
        if (!isTokenValid) {
            throw new UnauthorizedException('Token de atualização inválido');
        }

        const payload = {
            sub: tokenRecord.user.id,
            email: tokenRecord.user.email,
            role: tokenRecord.user.role,
        };

        const accessToken = this.jwtService.sign(payload);

        return { accessToken };
    }

    async logout(rawRefreshToken: string): Promise<void> {
        const parts = rawRefreshToken.split('.');
        if (parts.length !== 2) {
            // Token malformado — não vazar informação, apenas encerrar silenciosamente
            return;
        }

        const [id] = parts;

        try {
            await this.prisma.refreshToken.delete({ where: { id } });
        } catch {
            // Token não encontrado no banco (já expirou ou foi revogado) — comportamento esperado
        }
    }
}

