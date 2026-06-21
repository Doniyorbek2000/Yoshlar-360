import { IsOptional, IsEnum, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { RegionFilterDto } from '../../../common/dto/region-filter.dto';

export class FilterUserDto extends RegionFilterDto {
  @ApiPropertyOptional({ enum: Role }) @IsOptional() @IsEnum(Role) role?: Role;
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
}
