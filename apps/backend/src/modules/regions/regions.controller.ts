import { Controller, Get, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RegionsService } from './regions.service';

@ApiTags('Regions')
@Controller()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RegionsController {
  constructor(private regionsService: RegionsService) {}

  @Get('regions')
  @ApiOperation({ summary: 'Barcha viloyatlar' })
  findAll() {
    return this.regionsService.findAll();
  }

  @Get('regions/:regionId/districts')
  @ApiOperation({ summary: 'Viloyat tumanlari (nested)' })
  getDistrictsByRegion(@Param('regionId', ParseIntPipe) regionId: number) {
    return this.regionsService.getDistricts(regionId);
  }

  @Get('districts')
  @ApiOperation({ summary: 'Tumanlar (query filter)' })
  getDistricts(@Query('regionId') regionId?: string) {
    return this.regionsService.getDistricts(regionId ? parseInt(regionId) : undefined);
  }

  @Get('regions/districts/:districtId/mahallas')
  @ApiOperation({ summary: 'Tuman mahallalari (nested)' })
  getMahallasByDistrict(@Param('districtId', ParseIntPipe) districtId: number) {
    return this.regionsService.getMahallas(districtId);
  }

  @Get('mahallas')
  @ApiOperation({ summary: 'Mahallalar (query filter)' })
  getMahallas(@Query('districtId') districtId?: string) {
    return this.regionsService.getMahallas(districtId ? parseInt(districtId) : undefined);
  }
}
