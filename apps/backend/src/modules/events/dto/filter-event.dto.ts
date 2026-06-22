import { IsOptional, IsEnum, IsInt } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EventStatus, EventType } from '@prisma/client';
import { Type } from 'class-transformer';

export class FilterEventDto {
  @ApiPropertyOptional({ enum: EventStatus }) @IsOptional() @IsEnum(EventStatus) status?: EventStatus;
  @ApiPropertyOptional({ enum: EventType }) @IsOptional() @IsEnum(EventType) type?: EventType;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() regionId?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() page?: number;
  @ApiPropertyOptional() @IsOptional() @Type(() => Number) @IsInt() limit?: number;
}
