import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { diskStorage } = require('multer');

const uploadDir = join(process.cwd(), 'uploads');
if (!existsSync(uploadDir)) mkdirSync(uploadDir, { recursive: true });

@ApiTags('Upload')
@Controller('upload')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UploadController {
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
        const allowed = /\.(jpg|jpeg|png|gif|pdf|doc|docx|mp4|avi|mov)$/i;
        if (!allowed.test(extname(file.originalname))) {
          return cb(new BadRequestException('Ruxsat etilmagan fayl turi'), false);
        }
        cb(null, true);
      },
    }),
  )
  upload(@UploadedFile() file: any) {
    if (!file) throw new BadRequestException('Fayl yuklanmadi');
    return { url: `/uploads/${file.filename}` };
  }
}
