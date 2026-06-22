import { IsString, IsOptional, IsInt, IsDateString, MinLength, IsArray, ValidateNested, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { QuestionType } from '@prisma/client';

export class CreateQuestionDto {
  @ApiProperty() @IsString() @MinLength(3) text: string;
  @ApiProperty({ enum: QuestionType }) @IsEnum(QuestionType) type: QuestionType;
  @ApiPropertyOptional() @IsOptional() options?: any;
  @ApiProperty() @IsInt() orderIndex: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isRequired?: boolean;
}

export class CreateSurveyDto {
  @ApiProperty() @IsString() @MinLength(3) title: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() startsAt?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() endsAt?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() regionId?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() districtId?: number;
  @ApiPropertyOptional() @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => CreateQuestionDto) questions?: CreateQuestionDto[];
}

export class SubmitResponseDto {
  @ApiProperty() @IsArray() answers: { questionId: number; value: string }[];
}
