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
