import { IsEmail, IsString, MinLength, IsEnum, IsOptional, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export class RegisterDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  fullName: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ enum: Role })
  @IsEnum(Role)
  role: Role;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  regionId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  districtId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  mahallaId?: number;
}
