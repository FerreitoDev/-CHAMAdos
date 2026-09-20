import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { UserRole } from '../generated/prisma/client';
import { AssignTicketDto } from './dto/assign-ticket.dto';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { FilterTicketsDto } from './dto/filter-tickets.dto';
import { ReassignTicketDto } from './dto/reassign-ticket.dto';
import { ReopenTicketDto } from './dto/reopen-ticket.dto';
import { ResolveTicketDto } from './dto/resolve-ticket.dto';
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

  @Patch(':id/assign')
  @Roles(UserRole.TECHNICIAN, UserRole.ADMIN)
  async assign(
    @Param('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto?: AssignTicketDto,
  ): Promise<SafeTicket> {
    return this.ticketsService.assign(id, currentUser, dto);
  }

  @Patch(':id/reassign')
  @Roles(UserRole.ADMIN)
  async reassign(
    @Param('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: ReassignTicketDto,
  ): Promise<SafeTicket> {
    return this.ticketsService.reassign(id, currentUser, dto);
  }

  @Patch(':id/resolve')
  @Roles(UserRole.TECHNICIAN, UserRole.ADMIN)
  async resolve(
    @Param('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto?: ResolveTicketDto,
  ): Promise<SafeTicket> {
    return this.ticketsService.resolve(id, currentUser, dto);
  }

  @Patch(':id/close')
  @Roles(UserRole.ADMIN)
  async close(
    @Param('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<SafeTicket> {
    return this.ticketsService.close(id, currentUser);
  }

  @Patch(':id/reopen')
  @Roles(UserRole.USER, UserRole.ADMIN)
  async reopen(
    @Param('id') id: string,
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto?: ReopenTicketDto,
  ): Promise<SafeTicket> {
    return this.ticketsService.reopen(id, currentUser, dto);
  }
}
