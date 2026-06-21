import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { PaginationDto, PaginatedResult } from '../../common/dto/pagination.dto';

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  async findAll(
    query: PaginationDto & {
      userId?: number;
      action?: string;
      entity?: string;
    },
  ) {
    const where: any = {};
    if (query.userId) where.userId = query.userId;
    if (query.action)
      where.action = { contains: query.action, mode: 'insensitive' };
    if (query.entity) where.entity = query.entity;

    const page = query.page || 1;
    const limit = query.limit || 20;
    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { fullName: true, email: true } } },
      }),
      this.prisma.auditLog.count({ where }),
    ]);
    return new PaginatedResult(data, total, page, limit);
  }
}
