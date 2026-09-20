import { IsOptional, IsUUID } from 'class-validator';

export class AssignTicketDto {
  @IsUUID()
  @IsOptional()
  assigneeId?: string;
}
