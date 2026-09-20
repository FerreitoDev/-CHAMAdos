import { Test, TestingModule } from '@nestjs/testing';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { UserRole } from '../generated/prisma/client';
import { AUDIT_ACTIONS } from './audit.constants';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { SafeAudit } from './audit.types';

describe('AuditController', () => {
  let controller: AuditController;
  let service: AuditService;

  const mockAdmin: AuthenticatedUser = {
    id: 'admin-uuid-1',
    email: 'admin@test.com',
    role: UserRole.ADMIN,
  };

  const mockAudit: SafeAudit = {
    id: 'audit-uuid-1',
    action: AUDIT_ACTIONS.TICKET_CREATED,
    data: { title: 'Chamado de teste' },
    ticketId: 'ticket-uuid-1',
    actorId: mockAdmin.id,
    createdAt: new Date(),
    actor: {
      id: mockAdmin.id,
      name: 'Admin User',
      email: mockAdmin.email,
      role: UserRole.ADMIN,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  const mockAuditService = {
    findAllByTicket: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuditController],
      providers: [
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    controller = module.get<AuditController>(AuditController);
    service = module.get<AuditService>(AuditService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAllByTicket', () => {
    it('deve chamar auditService.findAllByTicket com ticketId e usuário autenticado', async () => {
      mockAuditService.findAllByTicket.mockResolvedValue([mockAudit]);

      const result = await controller.findAllByTicket('ticket-uuid-1', mockAdmin);

      expect(service.findAllByTicket).toHaveBeenCalledWith('ticket-uuid-1', mockAdmin);
      expect(result).toEqual([mockAudit]);
    });
  });
});
