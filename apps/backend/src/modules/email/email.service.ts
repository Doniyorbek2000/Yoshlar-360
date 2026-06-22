import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: any = null;

  constructor(private configService: ConfigService, private prisma: PrismaService) {
    this.initTransporter();
  }

  private async initTransporter() {
    try {
      const nodemailer = require('nodemailer');
      this.transporter = nodemailer.createTransport({
        host: this.configService.get('SMTP_HOST', 'smtp.gmail.com'),
        port: Number(this.configService.get('SMTP_PORT', 587)),
        secure: false,
        auth: {
          user: this.configService.get('SMTP_USER'),
          pass: this.configService.get('SMTP_PASS'),
        },
      });
    } catch (error) {
      this.logger.warn('Email transporter not configured');
    }
  }

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    const log = await this.prisma.emailLog.create({ data: { toEmail: to, subject, body: html } });
    try {
      if (!this.transporter) throw new Error('Email not configured');
      await this.transporter.sendMail({
        from: this.configService.get('SMTP_FROM', 'noreply@yoshlar360.uz'),
        to,
        subject,
        html,
      });
      await this.prisma.emailLog.update({ where: { id: log.id }, data: { status: 'SENT' } });
    } catch (error: any) {
      this.logger.error(`Email send failed: ${error.message}`);
      await this.prisma.emailLog.update({
        where: { id: log.id },
        data: { status: 'FAILED', errorMessage: error.message },
      });
    }
  }
}
