import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateYouthDto } from './dto/create-youth.dto';
import { FilterYouthDto } from './dto/filter-youth.dto';
import { PaginatedResult } from '../../common/dto/pagination.dto';
import { buildRegionFilter } from '../../common/utils/region-filter.util';
import { Role, RiskLevel } from '@prisma/client';
import * as argon2 from 'argon2';

@Injectable()
export class YouthService {
  constructor(private prisma: PrismaService) {}

  async findAll(filter: FilterYouthDto, currentUser: any) {
    const regionWhere = buildRegionFilter(currentUser, filter);
    const where: any = {};

    if (filter.search) {
      where.user = {
        OR: [
          { fullName: { contains: filter.search, mode: 'insensitive' } },
          { phone: { contains: filter.search } },
        ],
        ...regionWhere,
      };
    } else {
      where.user = regionWhere;
    }

    if (filter.riskLevel) where.riskLevel = filter.riskLevel;
    if (filter.gender) where.gender = filter.gender;
    if (filter.education) where.education = filter.education;
    if (filter.employmentStatus) where.employmentStatus = filter.employmentStatus;

    const page = filter.page || 1;
    const limit = filter.limit || 20;
    const [data, total] = await Promise.all([
      this.prisma.youthProfile.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              phone: true,
              regionId: true,
              districtId: true,
              mahallaId: true,
              region: { select: { nameUz: true } },
              district: { select: { nameUz: true } },
              mahalla: { select: { nameUz: true } },
            },
          },
        },
      }),
      this.prisma.youthProfile.count({ where }),
    ]);
    return new PaginatedResult(data, total, page, limit);
  }

  async findOne(id: number) {
    const youth = await this.prisma.youthProfile.findUnique({
      where: { id },
      include: {
        user: { include: { region: true, district: true, mahalla: true } },
      },
    });
    if (!youth) throw new NotFoundException('Yosh topilmadi');
    return youth;
  }

  async create(dto: CreateYouthDto) {
    const passwordHash = await argon2.hash('Youth12345');
    const email = dto.email || `youth_${Date.now()}@yoshlar360.uz`;

    const user = await this.prisma.user.create({
      data: {
        fullName: dto.fullName,
        email,
        phone: dto.phone,
        passwordHash,
        role: Role.YOUTH,
        regionId: dto.regionId,
        districtId: dto.districtId,
        mahallaId: dto.mahallaId,
        youthProfile: {
          create: {
            birthDate: dto.birthDate ? new Date(dto.birthDate) : null,
            gender: dto.gender,
            passportOrPinfl: dto.passportOrPinfl,
            education: dto.education,
            employmentStatus: dto.employmentStatus,
            socialStatus: dto.socialStatus,
            address: dto.address,
            interests: dto.interests,
            riskLevel: dto.riskLevel || RiskLevel.LOW,
          },
        },
      },
      include: { youthProfile: true },
    });
    const { passwordHash: _, ...result } = user;
    return result;
  }

  async update(id: number, dto: Partial<CreateYouthDto>) {
    const youth = await this.findOne(id);
    const profileData: any = {};
    if (dto.birthDate) profileData.birthDate = new Date(dto.birthDate);
    if (dto.gender) profileData.gender = dto.gender;
    if (dto.passportOrPinfl) profileData.passportOrPinfl = dto.passportOrPinfl;
    if (dto.education) profileData.education = dto.education;
    if (dto.employmentStatus) profileData.employmentStatus = dto.employmentStatus;
    if (dto.socialStatus) profileData.socialStatus = dto.socialStatus;
    if (dto.address) profileData.address = dto.address;
    if (dto.interests) profileData.interests = dto.interests;
    if (dto.riskLevel) profileData.riskLevel = dto.riskLevel;

    const updated = await this.prisma.youthProfile.update({
      where: { id },
      data: profileData,
      include: {
        user: { select: { id: true, fullName: true, email: true, phone: true } },
      },
    });

    if (dto.fullName || dto.phone) {
      await this.prisma.user.update({
        where: { id: youth.userId },
        data: {
          fullName: dto.fullName,
          phone: dto.phone,
          regionId: dto.regionId,
          districtId: dto.districtId,
          mahallaId: dto.mahallaId,
        },
      });
    }

    return updated;
  }

  async remove(id: number) {
    const youth = await this.findOne(id);
    await this.prisma.user.update({
      where: { id: youth.userId },
      data: { isActive: false },
    });
    return { message: 'Yosh profili o\'chirildi' };
  }
}
