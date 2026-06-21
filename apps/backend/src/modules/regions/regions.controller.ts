import { Controller, Get, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RegionsService } from './regions.service';

@ApiTags('Regions')
@Controller('regions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RegionsController {
  constructor(private regionsService: RegionsService) {}

  @Get()
  @ApiOperation({ summary: 'Barcha viloyatlar' })
  findAll() {
    return this.regionsService.findAll();
  }

  @Get(':regionId/districts')
  @ApiOperation({ summary: 'Viloyat tumanlari' })
  getDistricts(@Param('regionId', ParseIntPipe) regionId: number) {
    return this.regionsService.getDistricts(regionId);
  }

  @Get('districts/:districtId/mahallas')
  @ApiOperation({ summary: 'Tuman mahallalari' })
  getMahallas(@Param('districtId', ParseIntPipe) districtId: number) {
    return this.regionsService.getMahallas(districtId);
  }
}
