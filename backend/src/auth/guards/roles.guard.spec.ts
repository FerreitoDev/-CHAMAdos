import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { UserRole } from '../../generated/prisma/client';

describe('RolesGuard', () => {
    let guard: RolesGuard;
    let reflector: Reflector;

    const mockExecutionContext = (role: UserRole): ExecutionContext => ({
        getHandler: jest.fn(),
        getClass: jest.fn(),
        switchToHttp: jest.fn().mockReturnValue({
            getRequest: jest.fn().mockReturnValue({
                user: { id: 'user-1', email: 'test@test.com', role },
            }),
        }),
    }) as unknown as ExecutionContext;

    beforeEach(() => {
        reflector = new Reflector();
        guard = new RolesGuard(reflector);
    });

    it('deve permitir acesso quando o papel do usuário está na lista de roles exigidos', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);

        const context = mockExecutionContext(UserRole.ADMIN);
        expect(guard.canActivate(context)).toBe(true);
    });

    it('deve negar acesso quando o papel do usuário NÃO está na lista de roles exigidos', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);

        const context = mockExecutionContext(UserRole.USER);
        expect(guard.canActivate(context)).toBe(false);
    });

    it('deve permitir acesso quando nenhum @Roles() está definido na rota', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

        const context = mockExecutionContext(UserRole.USER);
        expect(guard.canActivate(context)).toBe(true);
    });

    it('deve permitir acesso quando @Roles() está vazio', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);

        const context = mockExecutionContext(UserRole.TECHNICIAN);
        expect(guard.canActivate(context)).toBe(true);
    });

    it('deve permitir acesso quando o papel está entre múltiplos roles permitidos', () => {
        jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN, UserRole.TECHNICIAN]);

        const context = mockExecutionContext(UserRole.TECHNICIAN);
        expect(guard.canActivate(context)).toBe(true);
    });
});
