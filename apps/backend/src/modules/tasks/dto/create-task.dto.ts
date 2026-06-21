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

export class CreateTaskDto {
  @ApiProperty() @IsString() @MinLength(3) title: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ enum: Priority })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;
  @ApiPropertyOptional() @IsOptional() @IsInt() assignedToId?: number;
  @ApiPropertyOptional() @IsOptional() @IsDateString() deadline?: string;
}
