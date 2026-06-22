import { Controller, Get, Post, Body, Query, Res, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { PdfService } from '../export/pdf.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(
    private reportsService: ReportsService,
    private pdfService: PdfService,
  ) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.REPUBLIC_ADMIN, Role.REGION_ADMIN, Role.DISTRICT_ADMIN)
  @ApiOperation({ summary: "Hisobotlar ro'yxati" })
  findAll(@CurrentUser() user: any) {
    return this.reportsService.findAll(user);
  }

  @Get('generate')
  @Roles(Role.SUPER_ADMIN, Role.REPUBLIC_ADMIN, Role.REGION_ADMIN, Role.DISTRICT_ADMIN)
  @ApiOperation({ summary: 'PDF hisobot generatsiya qilish' })
  async generateReport(
    @Query('type') type: string,
    @Query('regionId') regionId?: string,
    @Query('quarter') quarter?: string,
    @Query('year') year?: string,
    @Res() res?: any,
  ) {
    const pdf = await this.pdfService.generateReport({
      type: type || 'quarterly',
      regionId: regionId ? parseInt(regionId) : undefined,
      quarter: quarter ? parseInt(quarter) : undefined,
      year: year ? parseInt(year) : undefined,
    });
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename=report-${type}-${Date.now()}.pdf` });
    res.end(pdf);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.REPUBLIC_ADMIN, Role.REGION_ADMIN, Role.DISTRICT_ADMIN)
  @ApiOperation({ summary: 'Yangi hisobot' })
  create(
    @Body() body: { title: string; type: string; regionId?: number; districtId?: number; mahallaId?: number },
    @CurrentUser('id') userId: number,
  ) {
    return this.reportsService.create(body, userId);
  }
}
