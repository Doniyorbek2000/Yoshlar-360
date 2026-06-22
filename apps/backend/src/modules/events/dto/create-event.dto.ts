import { IsString, IsEnum, IsOptional, IsInt, IsDateString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EventType } from '@prisma/client';

export class CreateEventDto {
  @ApiProperty() @IsString() @MinLength(3) title: string;
  @ApiProperty() @IsString() @MinLength(10) description: string;
  @ApiProperty({ enum: EventType }) @IsEnum(EventType) type: EventType;
  @ApiProperty() @IsDateString() startDate: string;
  @ApiProperty() @IsDateString() endDate: string;
  @ApiProperty() @IsString() location: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() maxParticipants?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() imageUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() regionId?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() districtId?: number;
}
