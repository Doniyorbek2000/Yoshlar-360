import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateKpiDto } from './dto/create-kpi.dto';
import { FilterKpiDto } from './dto/filter-kpi.dto';
import { buildRegionFilter } from '../../common/utils/region-filter.util';

@Injectable()
export class KpiService {
  constructor(private prisma: PrismaService) {}

  async findAll(filter: FilterKpiDto, currentUser: any) {
    const regionWhere = buildRegionFilter(currentUser, filter);
    const where: any = { ...regionWhere };
    if (filter.metric) where.metric = filter.metric;
    if (filter.period) where.period = filter.period;
    if (filter.userId) where.userId = filter.userId;

    return this.prisma.kpiRecord.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { fullName: true, role: true } },
        region: { select: { nameUz: true } },
        district: { select: { nameUz: true } },
        mahalla: { select: { nameUz: true } },
      },
    });
  }

  async getUserKpi(userId: number) {
    const records = await this.prisma.kpiRecord.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
    const score = records.reduce((sum, r) => sum + r.value, 0);
    const appealsResolved = records.filter((r) => r.metric === 'appeals_resolved').reduce((s, r) => s + r.value, 0);
    const tasksDone = records.filter((r) => r.metric === 'tasks_done').reduce((s, r) => s + r.value, 0);
    const youthEngaged = records.filter((r) => r.metric === 'youth_engaged').reduce((s, r) => s + r.value, 0);
    return { score: Math.min(score, 100), appeals: appealsResolved, tasks: tasksDone, youth: youthEngaged, rank: 0 };
  }

  async create(dto: CreateKpiDto) {
    return this.prisma.kpiRecord.create({ data: dto });
  }

  async getRanking(period: string, currentUser: any) {
    const regionWhere = buildRegionFilter(currentUser);
    return this.prisma.kpiRecord.groupBy({
      by: ['regionId'],
      where: { period, ...regionWhere },
      _sum: { value: true },
      orderBy: { _sum: { value: 'desc' } },
    });
  }
}
