import { Controller, HttpCode, HttpStatus, Post, Body, Res, UnauthorizedException, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import * as Express from 'express';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Body() loginDto: LoginDto,
        @Res({ passthrough: true }) response: Express.Response,
    ) {
        const user = await this.authService.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            // Mensagem genérica para segurança e prevenção de enumeração de e-mails
            throw new UnauthorizedException('Credenciais inválidas');
        }

        const { accessToken, rawRefreshToken } = await this.authService.login(user);

        // Cookie seguro HttpOnly para o Refresh Token
        response.cookie('refreshToken', rawRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/auth',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 dias
        });

        return { accessToken };
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    async refresh(
        @Req() request: Express.Request,
    ) {
        const refreshToken = request.cookies?.['refreshToken'];
        if (!refreshToken) {
            throw new UnauthorizedException('Token de atualização não fornecido');
        }

        const { accessToken } = await this.authService.refresh(refreshToken);
        return { accessToken };
    }

    @Post('logout')
    @HttpCode(HttpStatus.NO_CONTENT)
    logout() {
        // TODO: Fase 1 — invalidar refresh token no banco e limpar cookie
    }
}
