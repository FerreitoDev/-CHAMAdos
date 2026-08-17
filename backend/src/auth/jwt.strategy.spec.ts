import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy, JwtPayload } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { UserRole } from '../generated/prisma/client';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtStrategy', () => {
    let strategy: JwtStrategy;
    let usersService: UsersService;

    const mockUser = {
        id: 'user-uuid-1',
        name: 'Fulano',
        email: 'fulano@exemplo.com',
        passwordHash: 'hashedpassword',
        role: UserRole.USER,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockConfigService = {
        getOrThrow: jest.fn().mockImplementation((key: string) => {
            if (key === 'JWT_SECRET') return 'testsecret';
            return null;
        }),
    };

    const mockUsersService = {
        findByEmail: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JwtStrategy,
                { provide: ConfigService, useValue: mockConfigService },
                { provide: UsersService, useValue: mockUsersService },
            ],
        }).compile();

        strategy = module.get<JwtStrategy>(JwtStrategy);
        usersService = module.get<UsersService>(UsersService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(strategy).toBeDefined();
    });

    describe('validate', () => {
        const payload: JwtPayload = {
            sub: 'user-uuid-1',
            email: 'fulano@exemplo.com',
            role: UserRole.USER,
        };

        it('deve retornar dados do usuário autenticado se ele for encontrado e ativo', async () => {
            mockUsersService.findByEmail.mockResolvedValue(mockUser);

            const result = await strategy.validate(payload);

            expect(usersService.findByEmail).toHaveBeenCalledWith('fulano@exemplo.com');
            expect(result).toEqual({
                id: 'user-uuid-1',
                email: 'fulano@exemplo.com',
                role: UserRole.USER,
            });
        });

        it('deve lançar UnauthorizedException se o usuário não for encontrado', async () => {
            mockUsersService.findByEmail.mockResolvedValue(null);

            await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
            expect(usersService.findByEmail).toHaveBeenCalledWith('fulano@exemplo.com');
        });

        it('deve lançar UnauthorizedException se o usuário estiver inativo', async () => {
            mockUsersService.findByEmail.mockResolvedValue({
                ...mockUser,
                active: false,
            });

            await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
            expect(usersService.findByEmail).toHaveBeenCalledWith('fulano@exemplo.com');
        });
    });
});
