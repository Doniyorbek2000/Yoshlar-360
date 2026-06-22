import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FilterUserDto } from './dto/filter-user.dto';
import { PaginatedResult } from '../../common/dto/pagination.dto';
import { buildRegionFilter } from '../../common/utils/region-filter.util';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(filter: FilterUserDto, currentUser: any) {
    const regionWhere = buildRegionFilter(currentUser, filter);
    const where: any = { ...regionWhere };
    if (filter.role) where.role = filter.role;
    if (filter.search) {
      where.OR = [
        { fullName: { contains: filter.search, mode: 'insensitive' } },
        { email: { contains: filter.search, mode: 'insensitive' } },
        { phone: { contains: filter.search } },
      ];
    }

    const page = filter.page || 1;
    const limit = filter.limit || 20;
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          role: true,
          regionId: true,
          districtId: true,
          mahallaId: true,
          isActive: true,
          createdAt: true,
          region: { select: { nameUz: true } },
          district: { select: { nameUz: true } },
          mahalla: { select: { nameUz: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);
    return new PaginatedResult(data, total, page, limit);
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { region: true, district: true, mahalla: true, youthProfile: true },
    });
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');
    const { passwordHash, ...result } = user;
    return result;
  }

  async findByTelegramId(telegramId: string) {
    const user = await this.prisma.user.findUnique({
      where: { telegramId },
      include: { region: true, district: true, mahalla: true, youthProfile: true },
    });
    if (!user) throw new NotFoundException('Foydalanuvchi topilmadi');
    const { passwordHash, ...result } = user;
    return result;
  }

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Bu email allaqachon mavjud');
    const passwordHash = await argon2.hash(dto.password);
    const { password, ...data } = dto;
    const user = await this.prisma.user.create({ data: { ...data, passwordHash } });
    const { passwordHash: _, ...result } = user;
    return result;
  }

  async update(id: number, dto: UpdateUserDto) {
    await this.findOne(id);
    const user = await this.prisma.user.update({ where: { id }, data: dto });
    const { passwordHash, ...result } = user;
    return result;
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.user.update({ where: { id }, data: { isActive: false } });
    return { message: 'Foydalanuvchi o\'chirildi' };
  }

  async changePassword(id: number, newPassword: string) {
    const passwordHash = await argon2.hash(newPassword);
    await this.prisma.user.update({ where: { id }, data: { passwordHash } });
    return { message: 'Parol o\'zgartirildi' };
  }
}
