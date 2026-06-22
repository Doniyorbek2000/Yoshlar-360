import {
  Controller, Post, Get, Delete, Param, Query, ParseIntPipe,
  UseInterceptors, UploadedFile, UseGuards, BadRequestException, Body,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { PrismaService } from '../../database/prisma.service';
import { extname, join } from 'path';
import { existsSync, mkdirSync, unlinkSync } from 'fs';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { diskStorage } = require('multer');

const uploadDir = join(process.cwd(), 'uploads');
if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });

@ApiTags('Upload')
@Controller('upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UploadController {
  constructor(private prisma: PrismaService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Fayl yuklash' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: uploadDir,
        filename: (_req: any, file: any, cb: any) => {
          const ext = extname(file.originalname);
          cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_req: any, file: any, cb: any) => {
        const allowed = /\.(jpg|jpeg|png|gif|pdf|doc|docx|xlsx|xls|mp4|avi|mov)$/i;
        if (!allowed.test(extname(file.originalname))) {
          return cb(new BadRequestException('Ruxsat etilmagan fayl turi'), false);
        }
        cb(null, true);
      },
    }),
  )
  async upload(
    @UploadedFile() file: any,
    @CurrentUser() user: any,
    @Body() body: { category?: string; entityType?: string; entityId?: string },
  ) {
    if (!file) throw new BadRequestException('Fayl yuklanmadi');

    const url = `/uploads/${file.filename}`;
    const mimeType = file.mimetype || 'application/octet-stream';
    let category = 'OTHER';
    if (mimeType.startsWith('image/')) category = 'IMAGE';
    else if (mimeType.startsWith('video/')) category = 'VIDEO';
    else if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('sheet')) category = 'DOCUMENT';
    if (body.category) category = body.category;

    const record = await this.prisma.fileRecord.create({
      data: {
        originalName: file.originalname,
        storedName: file.filename,
        mimeType,
        size: file.size,
        url,
        category: category as any,
        uploadedById: user.id,
        entityType: body.entityType,
        entityId: body.entityId ? parseInt(body.entityId) : null,
      },
    });

    return { url, id: record.id };
  }

  @Get()
  @ApiOperation({ summary: 'Fayllar ro\'yxati' })
  async findAll(@Query() query: { category?: string; entityType?: string; page?: string; limit?: string }) {
    const where: any = {};
    if (query.category) where.category = query.category;
    if (query.entityType) where.entityType = query.entityType;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const [data, total] = await Promise.all([
      this.prisma.fileRecord.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { uploadedBy: { select: { fullName: true } } },
      }),
      this.prisma.fileRecord.count({ where }),
    ]);
    return { data, total, page, limit };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Faylni o\'chirish' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    const file = await this.prisma.fileRecord.findUnique({ where: { id } });
    if (!file) throw new BadRequestException('Fayl topilmadi');
    try { unlinkSync(join(uploadDir, file.storedName)); } catch {}
    await this.prisma.fileRecord.delete({ where: { id } });
    return { message: 'Fayl o\'chirildi' };
  }
}
