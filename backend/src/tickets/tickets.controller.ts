import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { UserRole } from '../generated/prisma/client';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { FilterTicketsDto } from './dto/filter-tickets.dto';
import { TicketsService } from './tickets.service';
import { PaginatedTicketsResponse, SafeTicket } from './tickets.types';

@Controller('tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  @Roles(UserRole.USER, UserRole.TECHNICIAN, UserRole.ADMIN)
  async create(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: CreateTicketDto,
  ): Promise<SafeTicket> {
    return this.ticketsService.create(currentUser.id, dto);
  }

  @Get()
  async findAll(
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: FilterTicketsDto,
  ): Promise<PaginatedTicketsResponse> {
    return this.ticketsService.findAll(currentUser, query);
  }

  @Get(':id')
  async findById(
    @Param('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<SafeTicket> {
    return this.ticketsService.findById(id, currentUser);
  }
}
