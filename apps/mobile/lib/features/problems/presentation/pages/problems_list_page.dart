import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/color_constants.dart';
import '../../../../core/utils/helpers.dart';
import '../../../../shared/widgets/loading_widget.dart';
import '../../../../shared/widgets/error_widget.dart';
import '../../../../shared/widgets/empty_widget.dart';
import '../../../../shared/widgets/status_badge.dart';
import '../providers/problems_provider.dart';

class ProblemsListPage extends ConsumerWidget {
  const ProblemsListPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final problems = ref.watch(problemsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Muammolar')),
      body: problems.when(
        loading: () => const LoadingWidget(),
        error: (error, _) => AppErrorWidget(
          message: error.toString(),
          onRetry: () => ref.read(problemsProvider.notifier).refresh(),
        ),
        data: (data) {
          if (data.isEmpty) {
            return const EmptyWidget(
              message: 'Muammolar topilmadi',
              icon: Icons.warning_amber_outlined,
            );
          }
          return RefreshIndicator(
            onRefresh: () => ref.read(problemsProvider.notifier).refresh(),
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: data.length,
              itemBuilder: (context, index) {
                final problem = data[index];
                return _ProblemCard(problem: problem);
              },
            ),
          );
        },
      ),
    );
  }
}

class _ProblemCard extends StatelessWidget {
  final ProblemModel problem;

  const _ProblemCard({required this.problem});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    problem.title,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ),
                StatusBadge(status: problem.status),
              ],
            ),
            if (problem.description != null) ...[
              const SizedBox(height: 8),
              Text(
                problem.description!,
                style: const TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 14,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
            const SizedBox(height: 12),
            Row(
              children: [
                if (problem.riskLevel != null) ...[
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 3,
                    ),
                    decoration: BoxDecoration(
                      color: _getRiskColor(problem.riskLevel!)
                          .withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      problem.riskLevel!,
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: _getRiskColor(problem.riskLevel!),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                ],
                if (problem.regionName != null) ...[
                  const Icon(Icons.location_on,
                      size: 14, color: AppColors.textHint),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(
                      problem.regionName!,
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.textHint,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
                Text(
                  Helpers.timeAgo(problem.createdAt),
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textHint,
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Color _getRiskColor(String risk) {
    switch (risk.toUpperCase()) {
      case 'HIGH':
      case 'CRITICAL':
        return AppColors.error;
      case 'MEDIUM':
        return AppColors.warning;
      case 'LOW':
        return AppColors.success;
      default:
        return AppColors.textSecondary;
    }
  }
}
