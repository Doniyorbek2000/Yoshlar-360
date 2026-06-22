import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Param,
  Body,
  Query,
  Res,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AppealsService } from './appeals.service';
import { ExcelService } from '../export/excel.service';
import { CreateAppealDto } from './dto/create-appeal.dto';
import { FilterAppealDto } from './dto/filter-appeal.dto';
import { UpdateAppealStatusDto } from './dto/update-appeal-status.dto';
import { AddCommentDto } from './dto/add-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Appeals')
@Controller('appeals')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AppealsController {
  constructor(
    private appealsService: AppealsService,
    private excelService: ExcelService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Murojaatlar ro\'yxati' })
  findAll(@Query() filter: FilterAppealDto, @CurrentUser() user: any) {
    return this.appealsService.findAll(filter, user);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Foydalanuvchi murojaatlari' })
  findByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.appealsService.findByUser(userId, parseInt(page || '1'), parseInt(limit || '5'));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Murojaat tafsilotlari' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.appealsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Yangi murojaat' })
  create(@Body() dto: CreateAppealDto, @CurrentUser('id') userId: number) {
    return this.appealsService.create(dto, userId);
  }

  @Put(':id/status')
  @Roles(
    Role.SUPER_ADMIN,
    Role.REPUBLIC_ADMIN,
    Role.REGION_ADMIN,
    Role.DISTRICT_ADMIN,
    Role.MAHALLA_LEADER,
    Role.MODERATOR,
  )
  @ApiOperation({ summary: 'Murojaat statusini o\'zgartirish' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAppealStatusDto,
  ) {
    return this.appealsService.updateStatus(id, dto.status);
  }

  @Put(':id/assign/:assigneeId')
  @Roles(
    Role.SUPER_ADMIN,
    Role.REPUBLIC_ADMIN,
    Role.REGION_ADMIN,
    Role.DISTRICT_ADMIN,
    Role.MAHALLA_LEADER,
  )
  @ApiOperation({ summary: 'Murojaatni biriktirish' })
  assign(
    @Param('id', ParseIntPipe) id: number,
    @Param('assigneeId', ParseIntPipe) assigneeId: number,
  ) {
    return this.appealsService.assign(id, assigneeId);
  }

  @Post(':id/comments')
  @ApiOperation({ summary: 'Izoh qo\'shish' })
  addComment(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('id') userId: number,
    @Body() dto: AddCommentDto,
  ) {
    return this.appealsService.addComment(id, userId, dto.text);
  }

  @Post(':id/reply')
  @Roles(
    Role.SUPER_ADMIN,
    Role.REPUBLIC_ADMIN,
    Role.REGION_ADMIN,
    Role.DISTRICT_ADMIN,
    Role.MAHALLA_LEADER,
    Role.MODERATOR,
  )
  @ApiOperation({ summary: 'Murojaatga javob yozish' })
  reply(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { userId: number; text: string },
  ) {
    return this.appealsService.addComment(id, body.userId, body.text);
  }

  @Post(':id/rate')
  @ApiOperation({ summary: 'Murojaatni baholash' })
  rate(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { rating: number },
  ) {
    return { appealId: id, rating: body.rating };
  }

  @Patch(':id/status')
  @Roles(
    Role.SUPER_ADMIN,
    Role.REPUBLIC_ADMIN,
    Role.REGION_ADMIN,
    Role.DISTRICT_ADMIN,
    Role.MAHALLA_LEADER,
    Role.MODERATOR,
  )
  @ApiOperation({ summary: 'Murojaat statusini o\'zgartirish (PATCH)' })
  patchStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAppealStatusDto,
  ) {
    return this.appealsService.updateStatus(id, dto.status);
  }

  @Get('export/excel')
  @Roles(Role.SUPER_ADMIN, Role.REPUBLIC_ADMIN, Role.REGION_ADMIN, Role.DISTRICT_ADMIN)
  @ApiOperation({ summary: 'Murojaatlarni Excel formatda yuklash' })
  async exportExcel(@Query() filter: FilterAppealDto, @CurrentUser() user: any, @Res() res: any) {
    const result = await this.appealsService.findAll({ ...filter, limit: 10000 }, user);
    const columns = [
      { key: 'id', header: 'ID', width: 8 },
      { key: 'title', header: 'Sarlavha', width: 30 },
      { key: 'category', header: 'Kategoriya', width: 20 },
      { key: 'status', header: 'Status', width: 15 },
      { key: 'priority', header: 'Muhimlik', width: 12 },
      { key: 'youth', header: 'Murojaat qiluvchi', width: 25 },
      { key: 'region', header: 'Viloyat', width: 20 },
      { key: 'createdAt', header: 'Yaratilgan sana', width: 20 },
    ];
    const data = result.data.map((a: any) => ({
      id: a.id,
      title: a.title,
      category: a.category,
      status: a.status,
      priority: a.priority,
      youth: a.youth?.fullName || '',
      region: a.region?.nameUz || '',
      createdAt: new Date(a.createdAt).toLocaleDateString('uz-UZ'),
    }));
    const buffer = await this.excelService.exportToExcel(columns, data);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename=murojaatlar-${Date.now()}.xlsx`,
    });
    res.end(buffer);
  }
}
