import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AppealStatus } from '@prisma/client';

export class UpdateAppealStatusDto {
  @ApiProperty({ enum: AppealStatus }) @IsEnum(AppealStatus) status: AppealStatus;
}
