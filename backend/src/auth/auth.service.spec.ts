import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '../generated/prisma/client';
import * as argon2 from 'argon2';

// Mock do módulo argon2
jest.mock('argon2');

describe('AuthService', () => {
    let service: AuthService;
    let prismaService: PrismaService;
    let usersService: UsersService;
    let jwtService: JwtService;

    const mockUser = {
        id: 'user-uuid-1',
        name: 'Fulano',
        email: 'fulano@exemplo.com',
        passwordHash: 'hashedpassword123',
        role: UserRole.USER,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const mockPrismaService = {
        refreshToken: {
            create: jest.fn().mockResolvedValue({}),
        },
    };

    const mockUsersService = {
        findByEmail: jest.fn(),
    };

    const mockJwtService = {
        sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: UsersService, useValue: mockUsersService },
                { provide: JwtService, useValue: mockJwtService },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        prismaService = module.get<PrismaService>(PrismaService);
        usersService = module.get<UsersService>(UsersService);
        jwtService = module.get<JwtService>(JwtService);

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('validateUser', () => {
        it('deve retornar o usuário sem a senha (SafeUser) se as credenciais forem válidas e o usuário ativo', async () => {
            mockUsersService.findByEmail.mockResolvedValue(mockUser);
            (argon2.verify as jest.Mock).mockResolvedValue(true);

            const result = await service.validateUser('fulano@exemplo.com', 'senha123');

            expect(usersService.findByEmail).toHaveBeenCalledWith('fulano@exemplo.com');
            expect(argon2.verify).toHaveBeenCalledWith(mockUser.passwordHash, 'senha123');
            expect(result).toEqual({
                id: 'user-uuid-1',
                name: 'Fulano',
                email: 'fulano@exemplo.com',
                role: UserRole.USER,
                active: true,
                createdAt: mockUser.createdAt,
                updatedAt: mockUser.updatedAt,
            });
            expect(result).not.toHaveProperty('passwordHash');
        });

        it('deve retornar null se o usuário não for encontrado', async () => {
            mockUsersService.findByEmail.mockResolvedValue(null);

            const result = await service.validateUser('inexistente@exemplo.com', 'senha123');

            expect(usersService.findByEmail).toHaveBeenCalledWith('inexistente@exemplo.com');
            expect(argon2.verify).not.toHaveBeenCalled();
            expect(result).toBeNull();
        });

        it('deve retornar null se o usuário estiver inativo (active = false)', async () => {
            mockUsersService.findByEmail.mockResolvedValue({ ...mockUser, active: false });

            const result = await service.validateUser('inativo@exemplo.com', 'senha123');

            expect(usersService.findByEmail).toHaveBeenCalledWith('inativo@exemplo.com');
            expect(argon2.verify).not.toHaveBeenCalled();
            expect(result).toBeNull();
        });

        it('deve retornar null se a senha estiver incorreta', async () => {
            mockUsersService.findByEmail.mockResolvedValue(mockUser);
            (argon2.verify as jest.Mock).mockResolvedValue(false);

            const result = await service.validateUser('fulano@exemplo.com', 'senha_errada');

            expect(usersService.findByEmail).toHaveBeenCalledWith('fulano@exemplo.com');
            expect(argon2.verify).toHaveBeenCalledWith(mockUser.passwordHash, 'senha_errada');
            expect(result).toBeNull();
        });
    });

    describe('login', () => {
        it('deve gerar access token, refresh token e persistir o hash do refresh token no banco', async () => {
            const safeUser = {
                id: mockUser.id,
                name: mockUser.name,
                email: mockUser.email,
                role: mockUser.role,
                active: mockUser.active,
                createdAt: mockUser.createdAt,
                updatedAt: mockUser.updatedAt,
            };

            (argon2.hash as jest.Mock).mockResolvedValue('hashed-refresh-token');

            const result = await service.login(safeUser);

            expect(jwtService.sign).toHaveBeenCalledWith({
                sub: mockUser.id,
                email: mockUser.email,
                role: mockUser.role,
            });

            expect(argon2.hash).toHaveBeenCalledWith(result.rawRefreshToken);

            expect(prismaService.refreshToken.create).toHaveBeenCalledWith({
                data: {
                    tokenHash: 'hashed-refresh-token',
                    userId: mockUser.id,
                    expiresAt: expect.any(Date),
                },
            });

            expect(result).toHaveProperty('accessToken', 'mock-jwt-token');
            expect(result.rawRefreshToken).toBeDefined();
            expect(result.rawRefreshToken.length).toBeGreaterThan(0);
        });
    });
});
