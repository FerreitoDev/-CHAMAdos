import { Injectable } from '@nestjs/common';
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

        // Gera o Access Token que expira em 15 minutos (definido no JwtModule signOptions ou aqui)
        const accessToken = this.jwtService.sign(payload);

        // Gera o Refresh Token puro de forma criptograficamente segura
        const rawRefreshToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = await argon2.hash(rawRefreshToken);

        // Salva o hash do Refresh Token no banco com validade de 7 dias
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias
        await this.prisma.refreshToken.create({
            data: {
                tokenHash,
                userId: user.id,
                expiresAt,
            },
        });

        return {
            accessToken,
            rawRefreshToken,
        };
    }
}
