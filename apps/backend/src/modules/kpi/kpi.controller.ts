import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { KpiService } from './kpi.service';
import { CreateKpiDto } from './dto/create-kpi.dto';
import { FilterKpiDto } from './dto/filter-kpi.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('KPI')
@Controller('kpi')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class KpiController {
  constructor(private kpiService: KpiService) {}

  @Get()
  @ApiOperation({ summary: 'KPI ko\'rsatkichlari' })
  findAll(@Query() filter: FilterKpiDto, @CurrentUser() user: any) {
    return this.kpiService.findAll(filter, user);
  }

  @Post()
  @Roles(
    Role.SUPER_ADMIN,
    Role.REPUBLIC_ADMIN,
    Role.REGION_ADMIN,
    Role.DISTRICT_ADMIN,
  )
  @ApiOperation({ summary: 'KPI qo\'shish' })
  create(@Body() dto: CreateKpiDto) {
    return this.kpiService.create(dto);
  }

  @Get('ranking')
  @ApiOperation({ summary: 'KPI reyting' })
  getRanking(@Query('period') period: string, @CurrentUser() user: any) {
    return this.kpiService.getRanking(period, user);
  }
}
