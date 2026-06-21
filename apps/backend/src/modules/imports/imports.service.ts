import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ImportsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: number) {
    return this.prisma.importJob.findMany({
      where: { createdById: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const job = await this.prisma.importJob.findUnique({ where: { id } });
    if (!job) throw new NotFoundException('Import topilmadi');
    return job;
  }

  async createJob(fileUrl: string, userId: number) {
    return this.prisma.importJob.create({
      data: { fileUrl, createdById: userId, status: 'PENDING' },
    });
  }
}
