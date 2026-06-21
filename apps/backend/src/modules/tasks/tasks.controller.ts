import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { FilterTaskDto } from './dto/filter-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role, TaskStatus } from '@prisma/client';

@ApiTags('Tasks')
@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'Vazifalar ro\'yxati' })
  findAll(@Query() filter: FilterTaskDto, @CurrentUser() user: any) {
    return this.tasksService.findAll(filter, user);
  }

  @Get('overdue')
  @Roles(
    Role.SUPER_ADMIN,
    Role.REPUBLIC_ADMIN,
    Role.REGION_ADMIN,
    Role.DISTRICT_ADMIN,
  )
  @ApiOperation({ summary: 'Muddati o\'tgan vazifalar' })
  getOverdue() {
    return this.tasksService.getOverdue();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Vazifa tafsilotlari' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.findOne(id);
  }

  @Post()
  @Roles(
    Role.SUPER_ADMIN,
    Role.REPUBLIC_ADMIN,
    Role.REGION_ADMIN,
    Role.DISTRICT_ADMIN,
    Role.MAHALLA_LEADER,
    Role.MODERATOR,
  )
  @ApiOperation({ summary: 'Yangi vazifa' })
  create(@Body() dto: CreateTaskDto, @CurrentUser('id') userId: number) {
    return this.tasksService.create(dto, userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Vazifani tahrirlash' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateTaskDto>,
  ) {
    return this.tasksService.update(id, dto);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Vazifa statusini o\'zgartirish' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: TaskStatus,
  ) {
    return this.tasksService.updateStatus(id, status);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.REPUBLIC_ADMIN)
  @ApiOperation({ summary: 'Vazifani o\'chirish' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.remove(id);
  }
}
