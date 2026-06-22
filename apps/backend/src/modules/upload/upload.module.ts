import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [UploadController],
})
export class UploadModule {}
