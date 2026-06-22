import { IsString, IsOptional, IsInt, IsEnum, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

enum BroadcastTarget {
  ALL = 'ALL',
  ROLE = 'ROLE',
  REGION = 'REGION',
  DISTRICT = 'DISTRICT',
  MAHALLA = 'MAHALLA',
}

export class SendBroadcastDto {
  @ApiProperty({ enum: BroadcastTarget })
  @IsEnum(BroadcastTarget)
  target: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  targetId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  targetRole?: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  text: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fileUrl?: string;

  @ApiProperty()
  @IsInt()
  senderId: number;
}
