import { IsOptional, IsEnum, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProblemStatus, Priority } from '@prisma/client';
import { RegionFilterDto } from '../../../common/dto/region-filter.dto';

export class FilterProblemDto extends RegionFilterDto {
  @ApiPropertyOptional({ enum: ProblemStatus })
  @IsOptional()
  @IsEnum(ProblemStatus)
  status?: ProblemStatus;
  @ApiPropertyOptional({ enum: Priority })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;
  @ApiPropertyOptional() @IsOptional() @IsString() category?: string;
}
