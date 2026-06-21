import { Module } from '@nestjs/common';
import { YouthController } from './youth.controller';
import { YouthService } from './youth.service';

@Module({
  controllers: [YouthController],
  providers: [YouthService],
  exports: [YouthService],
})
export class YouthModule {}
