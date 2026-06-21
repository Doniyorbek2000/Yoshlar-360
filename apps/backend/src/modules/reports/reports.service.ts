import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { buildRegionFilter } from '../../common/utils/region-filter.util';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async findAll(currentUser: any) {
    const regionWhere = buildRegionFilter(currentUser);
    return this.prisma.report.findMany({
      where: regionWhere,
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: { select: { fullName: true } },
        region: { select: { nameUz: true } },
      },
    });
  }

  async create(
    data: {
      title: string;
      type: string;
      regionId?: number;
      districtId?: number;
      mahallaId?: number;
    },
    userId: number,
  ) {
    return this.prisma.report.create({
      data: { ...data, createdById: userId },
    });
  }
}
