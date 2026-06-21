import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class RegionsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.region.findMany({ orderBy: { nameUz: 'asc' } });
  }

  async getDistricts(regionId: number) {
    return this.prisma.district.findMany({
      where: { regionId },
      orderBy: { nameUz: 'asc' },
    });
  }

  async getMahallas(districtId: number) {
    return this.prisma.mahalla.findMany({
      where: { districtId },
      orderBy: { nameUz: 'asc' },
    });
  }
}
