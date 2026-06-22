import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class RegionsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.region.findMany({ orderBy: { nameUz: 'asc' } });
  }

  async getDistricts(regionId?: number) {
    const where: any = {};
    if (regionId) where.regionId = regionId;
    return this.prisma.district.findMany({
      where,
      orderBy: { nameUz: 'asc' },
    });
  }

  async getMahallas(districtId?: number) {
    const where: any = {};
    if (districtId) where.districtId = districtId;
    return this.prisma.mahalla.findMany({
      where,
      orderBy: { nameUz: 'asc' },
    });
  }
}
