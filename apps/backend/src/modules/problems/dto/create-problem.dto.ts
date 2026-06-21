import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  MinLength,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Priority } from '@prisma/client';

export class CreateProblemDto {
  @ApiProperty() @IsString() @MinLength(3) title: string;
  @ApiProperty() @IsString() @MinLength(10) description: string;
  @ApiProperty() @IsString() category: string;
  @ApiPropertyOptional({ enum: Priority })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;
  @ApiPropertyOptional() @IsOptional() @IsInt() regionId?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() districtId?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() mahallaId?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() assignedToId?: number;
  @ApiPropertyOptional() @IsOptional() @IsDateString() deadline?: string;
}
