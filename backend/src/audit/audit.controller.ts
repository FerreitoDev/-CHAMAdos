import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { UserRole } from '../generated/prisma/client';
import { AuditService } from './audit.service';
import { SafeAudit } from './audit.types';

@Controller('tickets/:ticketId/audit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TECHNICIAN)
  async findAllByTicket(
    @Param('ticketId') ticketId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<SafeAudit[]> {
    return this.auditService.findAllByTicket(ticketId, currentUser);
  }
}
