import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsInt,
  MinLength,
  IsEmail,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  Gender,
  EducationLevel,
  EmploymentStatus,
  SocialStatus,
  RiskLevel,
} from '@prisma/client';

export class CreateYouthDto {
  @ApiProperty() @IsString() @MinLength(2) fullName: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() birthDate?: string;
  @ApiPropertyOptional({ enum: Gender }) @IsOptional() @IsEnum(Gender) gender?: Gender;
  @ApiPropertyOptional() @IsOptional() @IsString() passportOrPinfl?: string;
  @ApiPropertyOptional({ enum: EducationLevel })
  @IsOptional()
  @IsEnum(EducationLevel)
  education?: EducationLevel;
  @ApiPropertyOptional({ enum: EmploymentStatus })
  @IsOptional()
  @IsEnum(EmploymentStatus)
  employmentStatus?: EmploymentStatus;
  @ApiPropertyOptional({ enum: SocialStatus })
  @IsOptional()
  @IsEnum(SocialStatus)
  socialStatus?: SocialStatus;
  @ApiPropertyOptional() @IsOptional() @IsString() address?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() interests?: string;
  @ApiPropertyOptional({ enum: RiskLevel })
  @IsOptional()
  @IsEnum(RiskLevel)
  riskLevel?: RiskLevel;
  @ApiPropertyOptional() @IsOptional() @IsInt() regionId?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() districtId?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() mahallaId?: number;
}
