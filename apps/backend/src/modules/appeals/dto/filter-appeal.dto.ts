import { IsOptional, IsEnum, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AppealStatus, Priority } from '@prisma/client';
import { RegionFilterDto } from '../../../common/dto/region-filter.dto';

export class FilterAppealDto extends RegionFilterDto {
  @ApiPropertyOptional({ enum: AppealStatus })
  @IsOptional()
  @IsEnum(AppealStatus)
  status?: AppealStatus;
  @ApiPropertyOptional({ enum: Priority })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;
  @ApiPropertyOptional() @IsOptional() @IsString() category?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
}
