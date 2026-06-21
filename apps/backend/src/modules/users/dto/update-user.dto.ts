import { IsString, IsOptional, IsEnum, IsInt, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class UpdateUserDto {
  @ApiPropertyOptional() @IsOptional() @IsString() fullName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional({ enum: Role }) @IsOptional() @IsEnum(Role) role?: Role;
  @ApiPropertyOptional() @IsOptional() @IsInt() regionId?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() districtId?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() mahallaId?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
}
