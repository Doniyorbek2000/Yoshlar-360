import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SurveysService } from './surveys.service';
import { CreateSurveyDto, SubmitResponseDto } from './dto/create-survey.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SurveyStatus } from '@prisma/client';

@ApiTags('Surveys')
@Controller('surveys')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SurveysController {
  constructor(private surveysService: SurveysService) {}

  @Get()
  @ApiOperation({ summary: 'So\'rovnomalar ro\'yxati' })
  findAll(@Query() filter: { status?: SurveyStatus; page?: string; limit?: string }, @CurrentUser() user: any) {
    return this.surveysService.findAll({ status: filter.status, page: Number(filter.page) || 1, limit: Number(filter.limit) || 20 }, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'So\'rovnoma tafsilotlari' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.surveysService.findOne(id);
  }

  @Get(':id/results')
  @ApiOperation({ summary: 'So\'rovnoma natijalari' })
  getResults(@Param('id', ParseIntPipe) id: number) {
    return this.surveysService.getResults(id);
  }

  @Post()
  @ApiOperation({ summary: 'So\'rovnoma yaratish' })
  create(@Body() dto: CreateSurveyDto, @CurrentUser() user: any) {
    return this.surveysService.create(dto, user.id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'So\'rovnomani yangilash' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: Partial<CreateSurveyDto>) {
    return this.surveysService.update(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'So\'rovnoma statusini o\'zgartirish' })
  updateStatus(@Param('id', ParseIntPipe) id: number, @Body('status') status: SurveyStatus) {
    return this.surveysService.updateStatus(id, status);
  }

  @Post(':id/questions')
  @ApiOperation({ summary: 'Savollarni yangilash' })
  upsertQuestions(@Param('id', ParseIntPipe) id: number, @Body() body: { questions: any[] }) {
    return this.surveysService.upsertQuestions(id, body.questions);
  }

  @Post(':id/respond')
  @ApiOperation({ summary: 'So\'rovnomaga javob berish' })
  submitResponse(@Param('id', ParseIntPipe) id: number, @Body() dto: SubmitResponseDto, @CurrentUser() user: any) {
    return this.surveysService.submitResponse(id, user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'So\'rovnomani o\'chirish' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.surveysService.remove(id);
  }
}
