import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateAppealDto } from './dto/create-appeal.dto';
import { FilterAppealDto } from './dto/filter-appeal.dto';
import { PaginatedResult } from '../../common/dto/pagination.dto';
import { buildRegionFilter } from '../../common/utils/region-filter.util';
import { AppealStatus } from '@prisma/client';

@Injectable()
export class AppealsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filter: FilterAppealDto, currentUser: any) {
    const regionWhere = buildRegionFilter(currentUser, filter);
    const where: any = { ...regionWhere };
    if (filter.status) where.status = filter.status;
    if (filter.priority) where.priority = filter.priority;
    if (filter.category) where.category = filter.category;
    if (filter.search) {
      where.OR = [
        { title: { contains: filter.search, mode: 'insensitive' } },
        { description: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    const page = filter.page || 1;
    const limit = filter.limit || 20;
    const [data, total] = await Promise.all([
      this.prisma.appeal.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          youth: { select: { fullName: true, phone: true } },
          assignedTo: { select: { fullName: true } },
          region: { select: { nameUz: true } },
          district: { select: { nameUz: true } },
          mahalla: { select: { nameUz: true } },
          _count: { select: { comments: true } },
        },
      }),
      this.prisma.appeal.count({ where }),
    ]);
    return new PaginatedResult(data, total, page, limit);
  }

  async findOne(id: number) {
    const appeal = await this.prisma.appeal.findUnique({
      where: { id },
      include: {
        youth: {
          select: { id: true, fullName: true, phone: true, email: true },
        },
        assignedTo: { select: { id: true, fullName: true } },
        region: true,
        district: true,
        mahalla: true,
        comments: {
          include: { user: { select: { fullName: true, role: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!appeal) throw new NotFoundException('Murojaat topilmadi');
    return appeal;
  }

  async create(dto: CreateAppealDto, userId: number) {
    return this.prisma.appeal.create({
      data: {
        ...dto,
        youthId: userId,
        priority: dto.priority || 'MEDIUM',
      },
    });
  }

  async updateStatus(id: number, status: AppealStatus) {
    await this.findOne(id);
    return this.prisma.appeal.update({ where: { id }, data: { status } });
  }

  async assign(id: number, assignedToId: number) {
    await this.findOne(id);
    return this.prisma.appeal.update({
      where: { id },
      data: { assignedToId, status: 'IN_PROGRESS' },
    });
  }

  async addComment(appealId: number, userId: number, text: string) {
    await this.findOne(appealId);
    return this.prisma.appealComment.create({
      data: { appealId, userId, text },
      include: { user: { select: { fullName: true, role: true } } },
    });
  }
}
