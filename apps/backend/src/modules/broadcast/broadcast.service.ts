import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class BroadcastService {
  constructor(private prisma: PrismaService) {}

  async send(payload: {
    target: string;
    targetId?: number;
    text: string;
    fileUrl?: string;
    senderId: number;
  }) {
    const where: any = { isActive: true, telegramId: { not: null } };

    switch (payload.target) {
      case 'ALL':
        break;
      case 'ROLE':
        if (payload.targetId) {
          // targetId is not used for role, but we may pass role name in text
        }
        break;
      case 'REGION':
        if (payload.targetId) where.regionId = payload.targetId;
        break;
      case 'DISTRICT':
        if (payload.targetId) where.districtId = payload.targetId;
        break;
      case 'MAHALLA':
        if (payload.targetId) where.mahallaId = payload.targetId;
        break;
    }

    const users = await this.prisma.user.findMany({
      where,
      select: { id: true, telegramId: true },
    });

    await this.prisma.notification.createMany({
      data: users.map((u) => ({
        userId: u.id,
        title: 'Broadcast',
        message: payload.text,
        type: 'BROADCAST' as NotificationType,
      })),
    });

    return { sent: users.length, failed: 0 };
  }
}
