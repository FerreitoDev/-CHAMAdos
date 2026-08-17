import { Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    login() {
        // TODO: Fase 1 — implementar login com email/senha
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    refresh() {
        // TODO: Fase 1 — renovar access token a partir do refresh token no cookie
    }

    @Post('logout')
    @HttpCode(HttpStatus.NO_CONTENT)
    logout() {
        // TODO: Fase 1 — invalidar refresh token no banco e limpar cookie
    }
}
