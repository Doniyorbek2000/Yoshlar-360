import { IsOptional, IsString, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RegionFilterDto } from '../../../common/dto/region-filter.dto';

export class FilterKpiDto extends RegionFilterDto {
  @ApiPropertyOptional() @IsOptional() @IsString() metric?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() period?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  userId?: number;
}
