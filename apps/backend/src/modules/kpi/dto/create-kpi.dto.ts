import { IsString, IsNumber, IsOptional, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateKpiDto {
  @ApiPropertyOptional() @IsOptional() @IsInt() userId?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() regionId?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() districtId?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() mahallaId?: number;
  @ApiProperty() @IsString() metric: string;
  @ApiProperty() @IsNumber() value: number;
  @ApiProperty({ example: '2024-01' }) @IsString() period: string;
}
