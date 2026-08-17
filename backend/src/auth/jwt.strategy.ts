import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { UserRole } from '../generated/prisma/client';

export interface JwtPayload {
    sub: string;
    email: string;
    role: UserRole;
}

export interface AuthenticatedUser {
    id: string;
    email: string;
    role: UserRole;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private readonly configService: ConfigService,
        private readonly usersService: UsersService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
        });
    }

    async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
        const user = await this.usersService.findByEmail(payload.email);

        if (!user || !user.active) {
            throw new UnauthorizedException('Acesso não autorizado');
        }

        return {
            id: user.id,
            email: user.email,
            role: user.role,
        };
    }
}
