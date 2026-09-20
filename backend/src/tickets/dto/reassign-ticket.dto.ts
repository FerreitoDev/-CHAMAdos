import { IsNotEmpty, IsUUID } from 'class-validator';

export class ReassignTicketDto {
  @IsUUID()
  @IsNotEmpty()
  assigneeId: string;
}
