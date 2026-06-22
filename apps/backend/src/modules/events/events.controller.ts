import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { FilterEventDto } from './dto/filter-event.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { EventStatus } from '@prisma/client';

@ApiTags('Events')
@Controller('events')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Get()
  @ApiOperation({ summary: 'Tadbirlar ro\'yxati' })
  findAll(@Query() filter: FilterEventDto, @CurrentUser() user: any) {
    return this.eventsService.findAll(filter, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Tadbir tafsilotlari' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Tadbir yaratish' })
  create(@Body() dto: CreateEventDto, @CurrentUser() user: any) {
    return this.eventsService.create(dto, user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Tadbirni yangilash' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateEventDto>) {
    return this.eventsService.update(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Tadbir statusini o\'zgartirish' })
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body('status') status: EventStatus) {
    return this.eventsService.updateStatus(id, status);
  }

  @Post(':id/register')
  @ApiOperation({ summary: 'Tadbirga ro\'yxatdan o\'tish' })
  register(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.eventsService.register(id, user.id);
  }

  @Post(':id/attend')
  @ApiOperation({ summary: 'Davomat belgilash' })
  markAttendance(@Param('id', ParseIntPipe) id: number, @Body() body: { userId: number; attended: boolean }) {
    return this.eventsService.markAttendance(id, body.userId, body.attended);
  }

  @Get(':id/participants')
  @ApiOperation({ summary: 'Ishtirokchilar ro\'yxati' })
  getParticipants(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.getParticipants(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Tadbirni o\'chirish' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.eventsService.remove(id);
  }
}
