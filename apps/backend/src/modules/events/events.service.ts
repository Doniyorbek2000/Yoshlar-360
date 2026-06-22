import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { FilterEventDto } from './dto/filter-event.dto';
import { buildRegionFilter } from '../../common/utils/region-filter.util';
import { EventStatus } from '@prisma/client';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filter: FilterEventDto, currentUser: any) {
    const regionWhere = buildRegionFilter(currentUser);
    const where: any = { ...regionWhere };
    if (filter.status) where.status = filter.status;
    if (filter.type) where.type = filter.type;

    const page = filter.page || 1;
    const limit = filter.limit || 20;
    const [data, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { startDate: 'desc' },
        include: {
          region: { select: { nameUz: true } },
          district: { select: { nameUz: true } },
          organizer: { select: { fullName: true } },
          _count: { select: { participants: true } },
        },
      }),
      this.prisma.event.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        region: true,
        district: true,
        organizer: { select: { id: true, fullName: true, phone: true } },
        participants: {
          include: { user: { select: { id: true, fullName: true, phone: true } } },
          orderBy: { registeredAt: 'desc' },
        },
      },
    });
    if (!event) throw new NotFoundException('Tadbir topilmadi');
    return event;
  }

  async create(dto: CreateEventDto, userId: number) {
    return this.prisma.event.create({
      data: {
        title: dto.title,
        description: dto.description,
        type: dto.type,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        location: dto.location,
        maxParticipants: dto.maxParticipants,
        imageUrl: dto.imageUrl,
        regionId: dto.regionId,
        districtId: dto.districtId,
        organizerId: userId,
        status: EventStatus.UPCOMING,
      },
    });
  }

  async update(id: number, dto: Partial<CreateEventDto>) {
    await this.findOne(id);
    const data: any = { ...dto };
    if (dto.startDate) data.startDate = new Date(dto.startDate);
    if (dto.endDate) data.endDate = new Date(dto.endDate);
    return this.prisma.event.update({ where: { id }, data });
  }

  async updateStatus(id: number, status: EventStatus) {
    await this.findOne(id);
    return this.prisma.event.update({ where: { id }, data: { status } });
  }

  async register(eventId: number, userId: number) {
    const event = await this.findOne(eventId);
    if (event.status !== EventStatus.UPCOMING) {
      throw new BadRequestException('Tadbirga ro\'yxatdan o\'tish mumkin emas');
    }
    if (event.maxParticipants) {
      const count = await this.prisma.eventParticipant.count({ where: { eventId } });
      if (count >= event.maxParticipants) {
        throw new BadRequestException('Tadbir to\'lgan');
      }
    }
    return this.prisma.eventParticipant.upsert({
      where: { eventId_userId: { eventId, userId } },
      create: { eventId, userId },
      update: {},
    });
  }

  async markAttendance(eventId: number, userId: number, attended: boolean) {
    return this.prisma.eventParticipant.update({
      where: { eventId_userId: { eventId, userId } },
      data: { attended, attendedAt: attended ? new Date() : null },
    });
  }

  async getParticipants(eventId: number) {
    return this.prisma.eventParticipant.findMany({
      where: { eventId },
      include: { user: { select: { id: true, fullName: true, phone: true, email: true } } },
      orderBy: { registeredAt: 'desc' },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.event.delete({ where: { id } });
  }
}
