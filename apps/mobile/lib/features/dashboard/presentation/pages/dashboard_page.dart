import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/color_constants.dart';
import '../../../../core/utils/helpers.dart';
import '../../../../shared/widgets/stats_card.dart';
import '../../../../shared/widgets/loading_widget.dart';
import '../../../../shared/widgets/error_widget.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../providers/dashboard_provider.dart';

class DashboardPage extends ConsumerWidget {
  const DashboardPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashboard = ref.watch(dashboardProvider);
    final user = ref.watch(currentUserProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Yoshlar 360'),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () => context.go('/notifications'),
          ),
        ],
      ),
      body: dashboard.when(
        loading: () => const LoadingWidget(),
        error: (error, _) => AppErrorWidget(
          message: error.toString(),
          onRetry: () => ref.read(dashboardProvider.notifier).refresh(),
        ),
        data: (data) => RefreshIndicator(
          onRefresh: () => ref.read(dashboardProvider.notifier).refresh(),
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Assalomu alaykum, ${user?.fullName ?? ''}',
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  Helpers.getRoleLabel(user?.role ?? ''),
                  style: const TextStyle(
                    fontSize: 14,
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 24),
                GridView.count(
                  crossAxisCount: 2,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  mainAxisSpacing: 12,
                  crossAxisSpacing: 12,
                  childAspectRatio: 1.3,
                  children: [
                    StatsCard(
                      title: 'Jami yoshlar',
                      value: '${data.totalYouth}',
                      icon: Icons.people,
                      color: AppColors.primary,
                      onTap: () => context.go('/youth'),
                    ),
                    StatsCard(
                      title: 'Jami murojaatlar',
                      value: '${data.totalAppeals}',
                      icon: Icons.message,
                      color: AppColors.info,
                      onTap: () => context.go('/appeals'),
                    ),
                    StatsCard(
                      title: 'Yangi murojaatlar',
                      value: '${data.newAppeals}',
                      icon: Icons.fiber_new,
                      color: AppColors.warning,
                    ),
                    StatsCard(
                      title: 'Hal qilingan',
                      value: '${data.resolvedAppeals}',
                      icon: Icons.check_circle,
                      color: AppColors.success,
                    ),
                    StatsCard(
                      title: 'Jami muammolar',
                      value: '${data.totalProblems}',
                      icon: Icons.warning_amber,
                      color: AppColors.error,
                      onTap: () => context.go('/problems'),
                    ),
                    StatsCard(
                      title: 'Jami vazifalar',
                      value: '${data.totalTasks}',
                      icon: Icons.task_alt,
                      color: AppColors.secondary,
                      onTap: () => context.go('/tasks'),
                    ),
                    StatsCard(
                      title: 'Bajarilgan',
                      value: '${data.doneTasks}',
                      icon: Icons.done_all,
                      color: AppColors.success,
                    ),
                    StatsCard(
                      title: 'Muddati o\'tgan',
                      value: '${data.overdueTasksCount}',
                      icon: Icons.schedule,
                      color: AppColors.error,
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                const Text(
                  'Tezkor amallar',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: 12),
                _QuickActionCard(
                  icon: Icons.add_circle_outline,
                  title: 'Yangi murojaat',
                  subtitle: 'Yangi murojaat yaratish',
                  color: AppColors.primary,
                  onTap: () => context.go('/appeals/create'),
                ),
                const SizedBox(height: 8),
                if (user?.isAdmin ?? false) ...[
                  _QuickActionCard(
                    icon: Icons.people_outline,
                    title: 'Yoshlar bazasi',
                    subtitle: 'Yoshlar ro\'yxatini ko\'rish',
                    color: AppColors.secondary,
                    onTap: () => context.go('/youth'),
                  ),
                  const SizedBox(height: 8),
                ],
                _QuickActionCard(
                  icon: Icons.bar_chart,
                  title: 'Vazifalar',
                  subtitle: 'Vazifalarni boshqarish',
                  color: AppColors.accent,
                  onTap: () => context.go('/tasks'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _QuickActionCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final Color color;
  final VoidCallback onTap;

  const _QuickActionCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, color: color),
        ),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
        subtitle: Text(subtitle),
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }
}
