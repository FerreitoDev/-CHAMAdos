import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { AuthenticatedUser } from '../auth/jwt.strategy';
import { UserRole } from '../generated/prisma/client';
import { CommentsService } from './comments.service';
import { SafeComment } from './comments.types';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('tickets/:ticketId/comments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @Roles(UserRole.USER, UserRole.TECHNICIAN, UserRole.ADMIN)
  async create(
    @Param('ticketId') ticketId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
    @Body() dto: CreateCommentDto,
  ): Promise<SafeComment> {
    return this.commentsService.create(ticketId, currentUser, dto);
  }

  @Get()
  @Roles(UserRole.USER, UserRole.TECHNICIAN, UserRole.ADMIN)
  async findAllByTicket(
    @Param('ticketId') ticketId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ): Promise<SafeComment[]> {
    return this.commentsService.findAllByTicket(ticketId, currentUser);
  }
}
