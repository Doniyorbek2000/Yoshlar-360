import {
  Controller,
  Get,
  Put,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Bildirishnomalar' })
  findAll(@CurrentUser('id') userId: number) {
    return this.notificationsService.getUserNotifications(userId);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'O\'qilmagan bildirishnomalar soni' })
  unreadCount(@CurrentUser('id') userId: number) {
    return this.notificationsService.getUnreadCount(userId);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Foydalanuvchi bildirishnomalari (bot uchun)' })
  findByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.notificationsService.getUserNotificationsPaginated(
      userId,
      parseInt(page || '1'),
      parseInt(limit || '10'),
    );
  }

  @Post('user/:userId/read-all')
  @ApiOperation({ summary: 'Foydalanuvchi bildirishnomalarini o\'qildi' })
  markAllReadByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.notificationsService.markAllAsRead(userId);
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'O\'qildi deb belgilash' })
  markAsRead(@Param('id', ParseIntPipe) id: number) {
    return this.notificationsService.markAsRead(id);
  }

  @Put('read-all')
  @ApiOperation({ summary: 'Barchasini o\'qildi deb belgilash' })
  markAllAsRead(@CurrentUser('id') userId: number) {
    return this.notificationsService.markAllAsRead(userId);
  }

  @Post('broadcast')
  @UseGuards(RolesGuard)
  @Roles(Role.SUPER_ADMIN, Role.REPUBLIC_ADMIN)
  @ApiOperation({ summary: 'Ommaviy xabar yuborish' })
  broadcast(
    @Body() body: { title: string; message: string; role?: string },
  ) {
    return this.notificationsService.broadcast(
      body.title,
      body.message,
      body.role,
    );
  }
}
