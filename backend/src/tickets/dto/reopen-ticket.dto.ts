import { IsOptional, IsString } from 'class-validator';

export class ReopenTicketDto {
  @IsString()
  @IsOptional()
  reopenReason?: string;
}
