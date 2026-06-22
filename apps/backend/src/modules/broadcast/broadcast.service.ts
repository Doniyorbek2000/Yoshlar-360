import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class BroadcastService {
  constructor(private prisma: PrismaService) {}

  async send(payload: {
    target: string;
    targetId?: number;
    targetRole?: string;
    text: string;
    fileUrl?: string;
    senderId: number;
  }) {
    const where: any = { isActive: true };

    switch (payload.target) {
      case 'ALL':
        break;
      case 'ROLE':
        if (payload.targetRole) {
          where.role = payload.targetRole;
        } else {
          throw new BadRequestException('targetRole is required when target is ROLE');
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
      default:
        throw new BadRequestException(`Invalid target: ${payload.target}`);
    }

    const users = await this.prisma.user.findMany({
      where,
      select: { id: true, telegramId: true },
    });

    if (users.length === 0) {
      return { sent: 0, failed: 0 };
    }

    const result = await this.prisma.notification.createMany({
      data: users.map((u) => ({
        userId: u.id,
        title: 'Broadcast',
        message: payload.text,
        type: 'BROADCAST' as NotificationType,
      })),
    });

    return { sent: result.count, failed: users.length - result.count };
  }
}
