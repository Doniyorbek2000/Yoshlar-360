import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Asosiy statistika' })
  getDashboard(@CurrentUser() user: any) {
    return this.dashboardService.getSummary(user);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Asosiy statistika (alias)' })
  getSummary(@CurrentUser() user: any) {
    return this.dashboardService.getSummary(user);
  }

  @Get('appeals-chart')
  @ApiOperation({ summary: 'Murojaatlar grafigi' })
  getAppealsChart(@CurrentUser() user: any) {
    return this.dashboardService.getAppealsChart(user);
  }

  @Get('region-stats')
  @ApiOperation({ summary: 'Hududiy statistika' })
  getRegionStats(@CurrentUser() user: any) {
    return this.dashboardService.getRegionStats(user);
  }

  @Get('task-stats')
  @ApiOperation({ summary: 'Vazifalar statistikasi' })
  getTaskStats() {
    return this.dashboardService.getTaskStats();
  }

  @Get('kpi-ranking')
  @ApiOperation({ summary: 'KPI reyting' })
  getKpiRanking(@CurrentUser() user: any) {
    return this.dashboardService.getKpiRanking(user);
  }
}
