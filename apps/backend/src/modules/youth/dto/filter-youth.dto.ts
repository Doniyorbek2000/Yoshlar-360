import { IsOptional, IsString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RiskLevel, Gender, EducationLevel, EmploymentStatus } from '@prisma/client';
import { RegionFilterDto } from '../../../common/dto/region-filter.dto';

export class FilterYouthDto extends RegionFilterDto {
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional({ enum: RiskLevel })
  @IsOptional()
  @IsEnum(RiskLevel)
  riskLevel?: RiskLevel;
  @ApiPropertyOptional({ enum: Gender }) @IsOptional() @IsEnum(Gender) gender?: Gender;
  @ApiPropertyOptional({ enum: EducationLevel })
  @IsOptional()
  @IsEnum(EducationLevel)
  education?: EducationLevel;
  @ApiPropertyOptional({ enum: EmploymentStatus })
  @IsOptional()
  @IsEnum(EmploymentStatus)
  employmentStatus?: EmploymentStatus;
}
