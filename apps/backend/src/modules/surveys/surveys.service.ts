import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateSurveyDto, SubmitResponseDto } from './dto/create-survey.dto';
import { SurveyStatus } from '@prisma/client';
import { buildRegionFilter } from '../../common/utils/region-filter.util';

@Injectable()
export class SurveysService {
  constructor(private prisma: PrismaService) {}

  async findAll(filter: { status?: SurveyStatus; page?: number; limit?: number }, currentUser: any) {
    const regionWhere = buildRegionFilter(currentUser);
    const where: any = {};
    if (filter.status) where.status = filter.status;
    if (regionWhere.regionId) where.regionId = regionWhere.regionId;

    const page = filter.page || 1;
    const limit = filter.limit || 20;
    const [data, total] = await Promise.all([
      this.prisma.survey.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          createdBy: { select: { fullName: true } },
          _count: { select: { responses: true, questions: true } },
        },
      }),
      this.prisma.survey.count({ where }),
    ]);
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: number) {
    const survey = await this.prisma.survey.findUnique({
      where: { id },
      include: {
        createdBy: { select: { fullName: true } },
        questions: { orderBy: { orderIndex: 'asc' } },
        _count: { select: { responses: true } },
      },
    });
    if (!survey) throw new NotFoundException('So\'rovnoma topilmadi');
    return survey;
  }

  async create(dto: CreateSurveyDto, userId: number) {
    return this.prisma.survey.create({
      data: {
        title: dto.title,
        description: dto.description,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
        regionId: dto.regionId,
        districtId: dto.districtId,
        createdById: userId,
        questions: dto.questions ? {
          create: dto.questions.map(q => ({
            text: q.text,
            type: q.type,
            options: q.options,
            orderIndex: q.orderIndex,
            isRequired: q.isRequired ?? true,
          })),
        } : undefined,
      },
      include: { questions: true },
    });
  }

  async update(id: number, dto: Partial<CreateSurveyDto>) {
    await this.findOne(id);
    const { questions, ...surveyData } = dto;
    const data: any = { ...surveyData };
    if (dto.startsAt) data.startsAt = new Date(dto.startsAt);
    if (dto.endsAt) data.endsAt = new Date(dto.endsAt);
    return this.prisma.survey.update({ where: { id }, data });
  }

  async updateStatus(id: number, status: SurveyStatus) {
    await this.findOne(id);
    return this.prisma.survey.update({ where: { id }, data: { status } });
  }

  async upsertQuestions(surveyId: number, questions: any[]) {
    await this.findOne(surveyId);
    await this.prisma.surveyQuestion.deleteMany({ where: { surveyId } });
    return this.prisma.surveyQuestion.createMany({
      data: questions.map(q => ({ surveyId, text: q.text, type: q.type, options: q.options, orderIndex: q.orderIndex, isRequired: q.isRequired ?? true })),
    });
  }

  async submitResponse(surveyId: number, userId: number, dto: SubmitResponseDto) {
    const survey = await this.findOne(surveyId);
    if (survey.status !== SurveyStatus.ACTIVE) {
      throw new BadRequestException('So\'rovnoma faol emas');
    }
    const existing = await this.prisma.surveyResponse.findUnique({
      where: { surveyId_userId: { surveyId, userId } },
    });
    if (existing) throw new BadRequestException('Siz allaqachon javob bergansiz');

    return this.prisma.surveyResponse.create({
      data: {
        surveyId,
        userId,
        answers: { create: dto.answers.map(a => ({ questionId: a.questionId, value: a.value })) },
      },
      include: { answers: true },
    });
  }

  async getResults(surveyId: number) {
    const survey = await this.prisma.survey.findUnique({
      where: { id: surveyId },
      include: {
        questions: { orderBy: { orderIndex: 'asc' }, include: { answers: true } },
        _count: { select: { responses: true } },
      },
    });
    if (!survey) throw new NotFoundException('So\'rovnoma topilmadi');

    const results = survey.questions.map(q => {
      const answers = q.answers.map(a => a.value);
      if (q.type === 'RATING' || q.type === 'NUMBER') {
        const nums = answers.map(Number).filter(n => !isNaN(n));
        return { questionId: q.id, text: q.text, type: q.type, totalAnswers: answers.length, average: nums.length > 0 ? nums.reduce((a, b) => a + b, 0) / nums.length : 0 };
      }
      if (q.type === 'SINGLE_CHOICE' || q.type === 'MULTIPLE_CHOICE') {
        const distribution: Record<string, number> = {};
        answers.forEach(a => {
          const vals = q.type === 'MULTIPLE_CHOICE' ? JSON.parse(a) : [a];
          vals.forEach((v: string) => { distribution[v] = (distribution[v] || 0) + 1; });
        });
        return { questionId: q.id, text: q.text, type: q.type, totalAnswers: answers.length, distribution };
      }
      return { questionId: q.id, text: q.text, type: q.type, totalAnswers: answers.length, sampleAnswers: answers.slice(0, 10) };
    });

    return { surveyId, title: survey.title, totalResponses: survey._count.responses, results };
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.survey.delete({ where: { id } });
  }
}
