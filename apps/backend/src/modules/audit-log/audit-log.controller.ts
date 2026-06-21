import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AuditLogService } from './audit-log.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Audit Logs')
@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.SUPER_ADMIN, Role.REPUBLIC_ADMIN)
@ApiBearerAuth()
export class AuditLogController {
  constructor(private auditLogService: AuditLogService) {}

  @Get()
  @ApiOperation({ summary: 'Audit loglar' })
  findAll(@Query() query: any) {
    return this.auditLogService.findAll(query);
  }
}
