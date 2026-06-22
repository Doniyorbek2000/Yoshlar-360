import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import axios from 'axios';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private token: string | null = null;
  private tokenExpiresAt: Date | null = null;

  constructor(private configService: ConfigService, private prisma: PrismaService) {}

  private async getToken(): Promise<string> {
    if (this.token && this.tokenExpiresAt && this.tokenExpiresAt > new Date()) {
      return this.token;
    }
    const email = this.configService.get('ESKIZ_EMAIL');
    const password = this.configService.get('ESKIZ_PASSWORD');
    if (!email || !password) throw new Error('Eskiz credentials not configured');

    const { data } = await axios.post('https://notify.eskiz.uz/api/auth/login', { email, password });
    this.token = data.data.token;
    this.tokenExpiresAt = new Date(Date.now() + 28 * 24 * 60 * 60 * 1000);
    return this.token!;
  }

  async sendSms(phone: string, message: string): Promise<void> {
    const log = await this.prisma.smsLog.create({ data: { phone, message } });
    try {
      const token = await this.getToken();
      const { data } = await axios.post('https://notify.eskiz.uz/api/message/sms/send', {
        mobile_phone: phone.replace('+', ''),
        message,
        from: '4546',
      }, { headers: { Authorization: `Bearer ${token}` } });

      await this.prisma.smsLog.update({
        where: { id: log.id },
        data: { status: 'SENT', eskizMessageId: data.id?.toString() },
      });
    } catch (error: any) {
      this.logger.error(`SMS send failed: ${error.message}`);
      await this.prisma.smsLog.update({
        where: { id: log.id },
        data: { status: 'FAILED', errorMessage: error.message },
      });
    }
  }

  async sendBulk(phones: string[], message: string): Promise<{ sent: number; failed: number }> {
    let sent = 0, failed = 0;
    for (const phone of phones) {
      try {
        await this.sendSms(phone, message);
        sent++;
      } catch {
        failed++;
      }
    }
    return { sent, failed };
  }
}
