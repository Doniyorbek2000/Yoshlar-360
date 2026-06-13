import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { YouthService } from './youth.service';

@ApiTags('Youth')
@Controller('youth')
export class YouthController {
  constructor(private youthService: YouthService) {}

  @Get()
  async findAll() {
    return this.youthService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.youthService.findOne(id);
  }

  @Post()
  async create(@Body() data: any) {
    return this.youthService.create(data);
  }
}