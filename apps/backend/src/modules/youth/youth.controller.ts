import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  Res,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { YouthService } from './youth.service';
import { ExcelService } from '../export/excel.service';
import { CreateYouthDto } from './dto/create-youth.dto';
import { FilterYouthDto } from './dto/filter-youth.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Youth')
@Controller('youth')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class YouthController {
  constructor(
    private youthService: YouthService,
    private excelService: ExcelService,
  ) {}

  @Get()
  @Roles(
    Role.SUPER_ADMIN,
    Role.REPUBLIC_ADMIN,
    Role.REGION_ADMIN,
    Role.DISTRICT_ADMIN,
    Role.MAHALLA_LEADER,
  )
  @ApiOperation({ summary: 'Yoshlar ro\'yxati' })
  findAll(@Query() filter: FilterYouthDto, @CurrentUser() user: any) {
    return this.youthService.findAll(filter, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Yosh profili' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.youthService.findOne(id);
  }

  @Post()
  @Roles(
    Role.SUPER_ADMIN,
    Role.REPUBLIC_ADMIN,
    Role.REGION_ADMIN,
    Role.DISTRICT_ADMIN,
    Role.MAHALLA_LEADER,
  )
  @ApiOperation({ summary: 'Yangi yosh yaratish' })
  create(@Body() dto: CreateYouthDto) {
    return this.youthService.create(dto);
  }

  @Put(':id')
  @Roles(
    Role.SUPER_ADMIN,
    Role.REPUBLIC_ADMIN,
    Role.REGION_ADMIN,
    Role.DISTRICT_ADMIN,
    Role.MAHALLA_LEADER,
  )
  @ApiOperation({ summary: 'Yosh profilini tahrirlash' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateYouthDto>,
  ) {
    return this.youthService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.REPUBLIC_ADMIN)
  @ApiOperation({ summary: 'Yosh profilini o\'chirish' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.youthService.remove(id);
  }

  @Get('export/excel')
  @Roles(Role.SUPER_ADMIN, Role.REPUBLIC_ADMIN, Role.REGION_ADMIN, Role.DISTRICT_ADMIN)
  @ApiOperation({ summary: 'Yoshlarni Excel formatda yuklash' })
  async exportExcel(@Query() filter: FilterYouthDto, @CurrentUser() user: any, @Res() res: any) {
    const result = await this.youthService.findAll({ ...filter, limit: 10000 }, user);
    const columns = [
      { key: 'id', header: 'ID', width: 8 },
      { key: 'fullName', header: 'F.I.O.', width: 30 },
      { key: 'phone', header: 'Telefon', width: 18 },
      { key: 'gender', header: 'Jinsi', width: 10 },
      { key: 'education', header: 'Ta\'lim', width: 18 },
      { key: 'employmentStatus', header: 'Bandlik', width: 18 },
      { key: 'riskLevel', header: 'Risk darajasi', width: 14 },
      { key: 'region', header: 'Viloyat', width: 20 },
    ];
    const data = result.data.map((y: any) => ({
      id: y.user?.id || y.id,
      fullName: y.user?.fullName || '',
      phone: y.user?.phone || '',
      gender: y.gender || '',
      education: y.education || '',
      employmentStatus: y.employmentStatus || '',
      riskLevel: y.riskLevel || '',
      region: y.user?.region?.nameUz || '',
    }));
    const buffer = await this.excelService.exportToExcel(columns, data);
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename=yoshlar-${Date.now()}.xlsx`,
    });
    res.end(buffer);
  }
}
