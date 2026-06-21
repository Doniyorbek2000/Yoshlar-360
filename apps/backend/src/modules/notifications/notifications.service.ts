import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async getUserNotifications(userId: number) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getUnreadCount(userId: number) {
    return this.prisma.notification.count({
      where: { userId, isRead: false },
    });
  }

  async markAsRead(id: number) {
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: number) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return { message: 'Barcha bildirishnomalar o\'qildi' };
  }

  async create(
    userId: number,
    title: string,
    message: string,
    type: NotificationType = 'SYSTEM',
  ) {
    return this.prisma.notification.create({
      data: { userId, title, message, type },
    });
  }

  async broadcast(title: string, message: string, roleFilter?: string) {
    const where: any = { isActive: true };
    if (roleFilter) where.role = roleFilter;
    const users = await this.prisma.user.findMany({
      where,
      select: { id: true },
    });
    await this.prisma.notification.createMany({
      data: users.map((u) => ({
        userId: u.id,
        title,
        message,
        type: 'BROADCAST' as NotificationType,
      })),
    });
    return { message: `${users.length} foydalanuvchiga yuborildi` };
  }
}
