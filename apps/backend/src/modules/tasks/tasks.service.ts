import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { FilterTaskDto } from './dto/filter-task.dto';
import { PaginatedResult } from '../../common/dto/pagination.dto';
import { TaskStatus } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async findAll(filter: FilterTaskDto, currentUser: any) {
    const where: any = {};
    if (filter.status) where.status = filter.status;
    if (filter.priority) where.priority = filter.priority;
    if (filter.assignedToId) where.assignedToId = filter.assignedToId;

    if (
      currentUser.role === 'MAHALLA_LEADER' ||
      currentUser.role === 'YOUTH'
    ) {
      where.OR = [
        { assignedToId: currentUser.id },
        { createdById: currentUser.id },
      ];
    }

    const page = filter.page || 1;
    const limit = filter.limit || 20;
    const [data, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          assignedTo: { select: { fullName: true } },
          createdBy: { select: { fullName: true } },
        },
      }),
      this.prisma.task.count({ where }),
    ]);
    return new PaginatedResult(data, total, page, limit);
  }

  async findOne(id: number) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        assignedTo: { select: { fullName: true } },
        createdBy: { select: { fullName: true } },
      },
    });
    if (!task) throw new NotFoundException('Vazifa topilmadi');
    return task;
  }

  async create(dto: CreateTaskDto, userId: number) {
    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        priority: dto.priority || 'MEDIUM',
        createdById: userId,
        assignedToId: dto.assignedToId,
        deadline: dto.deadline ? new Date(dto.deadline) : null,
      },
    });
  }

  async update(id: number, dto: Partial<CreateTaskDto>) {
    await this.findOne(id);
    const data: any = { ...dto };
    if (dto.deadline) data.deadline = new Date(dto.deadline);
    return this.prisma.task.update({ where: { id }, data });
  }

  async updateStatus(id: number, status: TaskStatus) {
    await this.findOne(id);
    return this.prisma.task.update({ where: { id }, data: { status } });
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.task.delete({ where: { id } });
    return { message: 'Vazifa o\'chirildi' };
  }

  async getOverdue() {
    return this.prisma.task.findMany({
      where: {
        deadline: { lt: new Date() },
        status: { in: ['TODO', 'IN_PROGRESS'] },
      },
      include: {
        assignedTo: { select: { fullName: true } },
        createdBy: { select: { fullName: true } },
      },
    });
  }
}
