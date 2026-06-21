import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { buildRegionFilter } from '../../common/utils/region-filter.util';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary(currentUser: any) {
    const regionWhere = buildRegionFilter(currentUser);
    const userWhere = { ...regionWhere, role: 'YOUTH' as any };

    const [
      totalYouth,
      totalAppeals,
      newAppeals,
      resolvedAppeals,
      totalProblems,
      totalTasks,
      doneTasks,
      overdueTasksCount,
    ] = await Promise.all([
      this.prisma.user.count({ where: userWhere }),
      this.prisma.appeal.count({ where: regionWhere }),
      this.prisma.appeal.count({ where: { ...regionWhere, status: 'NEW' } }),
      this.prisma.appeal.count({
        where: { ...regionWhere, status: 'RESOLVED' },
      }),
      this.prisma.problem.count({ where: regionWhere }),
      this.prisma.task.count(),
      this.prisma.task.count({ where: { status: 'DONE' } }),
      this.prisma.task.count({
        where: {
          deadline: { lt: new Date() },
          status: { in: ['TODO', 'IN_PROGRESS'] },
        },
      }),
    ]);

    return {
      totalYouth,
      totalAppeals,
      newAppeals,
      resolvedAppeals,
      totalProblems,
      totalTasks,
      doneTasks,
      overdueTasksCount,
    };
  }

  async getAppealsChart(currentUser: any) {
    const regionWhere = buildRegionFilter(currentUser);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const appeals = await this.prisma.appeal.findMany({
      where: { ...regionWhere, createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true, status: true },
    });

    const chartData: Record<
      string,
      { month: string; total: number; resolved: number }
    > = {};
    appeals.forEach((a) => {
      const month = `${a.createdAt.getFullYear()}-${String(a.createdAt.getMonth() + 1).padStart(2, '0')}`;
      if (!chartData[month])
        chartData[month] = { month, total: 0, resolved: 0 };
      chartData[month].total++;
      if (a.status === 'RESOLVED') chartData[month].resolved++;
    });

    return Object.values(chartData).sort((a, b) =>
      a.month.localeCompare(b.month),
    );
  }

  async getRegionStats(currentUser: any) {
    const regions = await this.prisma.region.findMany({
      include: {
        _count: { select: { users: true, appeals: true, problems: true } },
      },
    });
    return regions.map((r) => ({
      id: r.id,
      nameUz: r.nameUz,
      users: r._count.users,
      appeals: r._count.appeals,
      problems: r._count.problems,
    }));
  }

  async getTaskStats() {
    const statuses = ['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED'] as const;
    const results = await Promise.all(
      statuses.map((status) => this.prisma.task.count({ where: { status } })),
    );
    return statuses.map((status, i) => ({ status, count: results[i] }));
  }

  async getKpiRanking(currentUser: any) {
    const currentMonth = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
    return this.prisma.kpiRecord.findMany({
      where: { period: currentMonth },
      orderBy: { value: 'desc' },
      take: 10,
      include: {
        region: { select: { nameUz: true } },
        user: { select: { fullName: true } },
      },
    });
  }
}
