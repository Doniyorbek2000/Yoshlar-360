import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/color_constants.dart';
import '../../../../core/utils/helpers.dart';
import '../../../../shared/widgets/loading_widget.dart';
import '../../../../shared/widgets/error_widget.dart';
import '../../../../shared/widgets/status_badge.dart';
import '../providers/tasks_provider.dart';

class TaskDetailPage extends ConsumerWidget {
  final int taskId;

  const TaskDetailPage({super.key, required this.taskId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final detail = ref.watch(taskDetailProvider(taskId));

    return Scaffold(
      appBar: AppBar(title: const Text('Vazifa')),
      body: detail.when(
        loading: () => const LoadingWidget(),
        error: (error, _) => AppErrorWidget(
          message: error.toString(),
          onRetry: () => ref.invalidate(taskDetailProvider(taskId)),
        ),
        data: (task) => SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      task.title,
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ),
                  StatusBadge(status: task.status, fontSize: 14),
                ],
              ),
              if (task.description != null) ...[
                const SizedBox(height: 16),
                Text(
                  task.description!,
                  style: const TextStyle(
                    fontSize: 15,
                    color: AppColors.textPrimary,
                    height: 1.6,
                  ),
                ),
              ],
              const SizedBox(height: 24),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      _DetailRow(
                        icon: Icons.flag,
                        label: 'Muhimlik',
                        value: Helpers.getPriorityLabel(task.priority),
                        valueColor: Helpers.getPriorityColor(task.priority),
                      ),
                      if (task.assigneeName != null)
                        _DetailRow(
                          icon: Icons.person,
                          label: 'Mas\'ul',
                          value: task.assigneeName!,
                        ),
                      if (task.creatorName != null)
                        _DetailRow(
                          icon: Icons.person_outline,
                          label: 'Yaratuvchi',
                          value: task.creatorName!,
                        ),
                      if (task.deadline != null)
                        _DetailRow(
                          icon: Icons.schedule,
                          label: 'Muddat',
                          value: Helpers.formatDate(task.deadline),
                          valueColor:
                              task.isOverdue ? AppColors.error : null,
                        ),
                      if (task.regionName != null)
                        _DetailRow(
                          icon: Icons.location_on,
                          label: 'Hudud',
                          value: task.regionName!,
                        ),
                      _DetailRow(
                        icon: Icons.calendar_today,
                        label: 'Yaratilgan',
                        value: Helpers.formatDateTime(task.createdAt),
                      ),
                    ],
                  ),
                ),
              ),
              if (task.status != 'DONE' && task.status != 'CANCELLED') ...[
                const SizedBox(height: 24),
                Row(
                  children: [
                    if (task.status == 'TODO')
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () async {
                            await ref
                                .read(tasksProvider.notifier)
                                .updateStatus(task.id, 'IN_PROGRESS');
                            ref.invalidate(taskDetailProvider(taskId));
                          },
                          icon: const Icon(Icons.play_arrow),
                          label: const Text('Boshlash'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.info,
                          ),
                        ),
                      ),
                    if (task.status == 'IN_PROGRESS') ...[
                      Expanded(
                        child: ElevatedButton.icon(
                          onPressed: () async {
                            await ref
                                .read(tasksProvider.notifier)
                                .updateStatus(task.id, 'DONE');
                            ref.invalidate(taskDetailProvider(taskId));
                          },
                          icon: const Icon(Icons.check),
                          label: const Text('Bajarildi'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.success,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color? valueColor;

  const _DetailRow({
    required this.icon,
    required this.label,
    required this.value,
    this.valueColor,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Icon(icon, size: 20, color: AppColors.textSecondary),
          const SizedBox(width: 12),
          Text(
            '$label:',
            style: const TextStyle(
              color: AppColors.textSecondary,
              fontSize: 14,
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              value,
              style: TextStyle(
                fontWeight: FontWeight.w500,
                fontSize: 14,
                color: valueColor ?? AppColors.textPrimary,
              ),
              textAlign: TextAlign.end,
            ),
          ),
        ],
      ),
    );
  }
}
