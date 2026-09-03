import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserRole } from '../../generated/prisma/client';

export class UpdateUserDto {
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    name?: string;

    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole;
}
