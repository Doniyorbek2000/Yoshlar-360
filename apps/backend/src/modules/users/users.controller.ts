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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FilterUserDto } from './dto/filter-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@prisma/client';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles(Role.SUPER_ADMIN, Role.REPUBLIC_ADMIN, Role.REGION_ADMIN, Role.DISTRICT_ADMIN, Role.MAHALLA_LEADER)
  @ApiOperation({ summary: 'Foydalanuvchilar ro\'yxati' })
  findAll(@Query() filter: FilterUserDto, @CurrentUser() user: any) {
    return this.usersService.findAll(filter, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Foydalanuvchi ma\'lumotlari' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Post()
  @Roles(Role.SUPER_ADMIN, Role.REPUBLIC_ADMIN)
  @ApiOperation({ summary: 'Yangi foydalanuvchi' })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Put(':id')
  @Roles(Role.SUPER_ADMIN, Role.REPUBLIC_ADMIN)
  @ApiOperation({ summary: 'Foydalanuvchini tahrirlash' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.SUPER_ADMIN)
  @ApiOperation({ summary: 'Foydalanuvchini o\'chirish' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

  @Put(':id/password')
  @Roles(Role.SUPER_ADMIN, Role.REPUBLIC_ADMIN)
  @ApiOperation({ summary: 'Parolni o\'zgartirish' })
  changePassword(
    @Param('id', ParseIntPipe) id: number,
    @Body('password') password: string,
  ) {
    return this.usersService.changePassword(id, password);
  }
}
