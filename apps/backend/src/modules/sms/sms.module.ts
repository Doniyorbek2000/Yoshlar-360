import { Module, Global } from '@nestjs/common';
import { SmsService } from './sms.service';
import { DatabaseModule } from '../../database/database.module';

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [SmsService],
  exports: [SmsService],
})
export class SmsModule {}
