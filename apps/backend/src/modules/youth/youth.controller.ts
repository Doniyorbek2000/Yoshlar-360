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
import { YouthService } from './youth.service';
import { CreateYouthDto } from './dto/create-youth.dto';
import { FilterYouthDto } from './dto/filter-youth.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Youth')
@Controller('youth')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class YouthController {
  constructor(private youthService: YouthService) {}

  @Get()
  @Roles(
    Role.SUPER_ADMIN,
    Role.REPUBLIC_ADMIN,
    Role.REGION_ADMIN,
    Role.DISTRICT_ADMIN,
    Role.MAHALLA_LEADER,
  )
  @ApiOperation({ summary: 'Yoshlar ro\'yxati' })
  findAll(@Query() filter: FilterYouthDto, @CurrentUser() user: any) {
    return this.youthService.findAll(filter, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Yosh profili' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.youthService.findOne(id);
  }

  @Post()
  @Roles(
    Role.SUPER_ADMIN,
    Role.REPUBLIC_ADMIN,
    Role.REGION_ADMIN,
    Role.DISTRICT_ADMIN,
    Role.MAHALLA_LEADER,
  )
  @ApiOperation({ summary: 'Yangi yosh yaratish' })
  create(@Body() dto: CreateYouthDto) {
    return this.youthService.create(dto);
  }

  @Put(':id')
  @Roles(
    Role.SUPER_ADMIN,
    Role.REPUBLIC_ADMIN,
    Role.REGION_ADMIN,
    Role.DISTRICT_ADMIN,
    Role.MAHALLA_LEADER,
  )
  @ApiOperation({ summary: 'Yosh profilini tahrirlash' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateYouthDto>,
  ) {
    return this.youthService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN, Role.REPUBLIC_ADMIN)
  @ApiOperation({ summary: 'Yosh profilini o\'chirish' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.youthService.remove(id);
  }
}
