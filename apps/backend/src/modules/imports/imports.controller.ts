import { Controller, Get, Post, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ImportsService } from './imports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Imports')
@Controller('imports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.REPUBLIC_ADMIN, Role.REGION_ADMIN, Role.DISTRICT_ADMIN)
@ApiBearerAuth()
export class ImportsController {
  constructor(private importsService: ImportsService) {}

  @Get()
  @ApiOperation({ summary: "Import ishlari ro'yxati" })
  findAll(@CurrentUser('id') userId: number) {
    return this.importsService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Import holati' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.importsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Yangi import' })
  create(@Body() body: { fileUrl: string }, @CurrentUser('id') userId: number) {
    return this.importsService.createJob(body.fileUrl, userId);
  }
}
