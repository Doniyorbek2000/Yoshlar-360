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
import { ProblemsService } from './problems.service';
import { CreateProblemDto } from './dto/create-problem.dto';
import { FilterProblemDto } from './dto/filter-problem.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role, ProblemStatus } from '@prisma/client';

@ApiTags('Problems')
@Controller('problems')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ProblemsController {
  constructor(private problemsService: ProblemsService) {}

  @Get()
  @ApiOperation({ summary: 'Muammolar ro\'yxati' })
  findAll(@Query() filter: FilterProblemDto, @CurrentUser() user: any) {
    return this.problemsService.findAll(filter, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Muammo tafsilotlari' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.problemsService.findOne(id);
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
  @ApiOperation({ summary: 'Yangi muammo' })
  create(
    @Body() dto: CreateProblemDto,
    @CurrentUser('id') userId: number,
  ) {
    return this.problemsService.create(dto, userId);
  }

  @Put(':id')
  @Roles(
    Role.SUPER_ADMIN,
    Role.REPUBLIC_ADMIN,
    Role.REGION_ADMIN,
    Role.DISTRICT_ADMIN,
    Role.MAHALLA_LEADER,
    Role.MODERATOR,
  )
  @ApiOperation({ summary: 'Muammoni tahrirlash' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateProblemDto>,
  ) {
    return this.problemsService.update(id, dto);
  }

  @Put(':id/status')
  @Roles(
    Role.SUPER_ADMIN,
    Role.REPUBLIC_ADMIN,
    Role.REGION_ADMIN,
    Role.DISTRICT_ADMIN,
    Role.MAHALLA_LEADER,
    Role.MODERATOR,
  )
  @ApiOperation({ summary: 'Muammo statusini o\'zgartirish' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: ProblemStatus,
  ) {
    return this.problemsService.updateStatus(id, status);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.REPUBLIC_ADMIN)
  @ApiOperation({ summary: 'Muammoni o\'chirish' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.problemsService.remove(id);
  }
}
