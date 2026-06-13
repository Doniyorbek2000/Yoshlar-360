import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class YouthService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return [];
  }

  async findOne(id: string) {
    return null;
  }

  async create(data: any) {
    return data;
  }
}