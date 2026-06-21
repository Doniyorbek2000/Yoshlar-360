import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateProblemDto } from './dto/create-problem.dto';
import { FilterProblemDto } from './dto/filter-problem.dto';
import { PaginatedResult } from '../../common/dto/pagination.dto';
import { buildRegionFilter } from '../../common/utils/region-filter.util';
import { ProblemStatus } from '@prisma/client';

@Injectable()
export class ProblemsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filter: FilterProblemDto, currentUser: any) {
    const regionWhere = buildRegionFilter(currentUser, filter);
    const where: any = { ...regionWhere };
    if (filter.status) where.status = filter.status;
    if (filter.priority) where.priority = filter.priority;
    if (filter.category) where.category = filter.category;

    const page = filter.page || 1;
    const limit = filter.limit || 20;
    const [data, total] = await Promise.all([
      this.prisma.problem.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: { select: { fullName: true } },
          assignedTo: { select: { fullName: true } },
          region: { select: { nameUz: true } },
          district: { select: { nameUz: true } },
          mahalla: { select: { nameUz: true } },
        },
      }),
      this.prisma.problem.count({ where }),
    ]);
    return new PaginatedResult(data, total, page, limit);
  }

  async findOne(id: number) {
    const problem = await this.prisma.problem.findUnique({
      where: { id },
      include: {
        createdBy: { select: { fullName: true } },
        assignedTo: { select: { fullName: true } },
        region: true,
        district: true,
        mahalla: true,
      },
    });
    if (!problem) throw new NotFoundException('Muammo topilmadi');
    return problem;
  }

  async create(dto: CreateProblemDto, userId: number) {
    return this.prisma.problem.create({
      data: {
        title: dto.title,
        description: dto.description,
        category: dto.category,
        priority: dto.priority || 'MEDIUM',
        createdById: userId,
        regionId: dto.regionId,
        districtId: dto.districtId,
        mahallaId: dto.mahallaId,
        assignedToId: dto.assignedToId,
        deadline: dto.deadline ? new Date(dto.deadline) : null,
      },
    });
  }

  async update(id: number, dto: Partial<CreateProblemDto>) {
    await this.findOne(id);
    const data: any = { ...dto };
    if (dto.deadline) data.deadline = new Date(dto.deadline);
    return this.prisma.problem.update({ where: { id }, data });
  }

  async updateStatus(id: number, status: ProblemStatus) {
    await this.findOne(id);
    return this.prisma.problem.update({ where: { id }, data: { status } });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.problem.delete({ where: { id } });
    return { message: 'Muammo o\'chirildi' };
  }
}
