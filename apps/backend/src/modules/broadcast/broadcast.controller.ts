import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { BroadcastService } from './broadcast.service';

@ApiTags('Broadcast')
@Controller('broadcast')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class BroadcastController {
  constructor(private broadcastService: BroadcastService) {}

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.REPUBLIC_ADMIN, Role.REGION_ADMIN)
  @ApiOperation({ summary: 'Ommaviy xabar yuborish' })
  send(@Body() body: {
    target: string;
    targetId?: number;
    text: string;
    fileUrl?: string;
    senderId: number;
  }) {
    return this.broadcastService.send(body);
  }
}
