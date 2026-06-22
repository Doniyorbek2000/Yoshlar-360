import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/color_constants.dart';
import '../../../../core/utils/helpers.dart';
import '../../../../shared/widgets/loading_widget.dart';
import '../../../../shared/widgets/error_widget.dart';
import '../../../../shared/widgets/empty_widget.dart';
import '../../../../shared/widgets/status_badge.dart';
import '../providers/tasks_provider.dart';

class TasksListPage extends ConsumerStatefulWidget {
  const TasksListPage({super.key});

  @override
  ConsumerState<TasksListPage> createState() => _TasksListPageState();
}

class _TasksListPageState extends ConsumerState<TasksListPage> {
  String? _selectedStatus;
  final _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      ref.read(tasksProvider.notifier).loadMore();
    }
  }

  @override
  Widget build(BuildContext context) {
    final tasksState = ref.watch(tasksProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Vazifalar'),
        actions: [
          PopupMenuButton<String?>(
            icon: const Icon(Icons.filter_list),
            onSelected: (value) {
              setState(() => _selectedStatus = value);
              ref.read(tasksProvider.notifier).refresh(status: value);
            },
            itemBuilder: (context) => [
              const PopupMenuItem(value: null, child: Text('Barchasi')),
              const PopupMenuItem(value: 'TODO', child: Text('Bajarilmagan')),
              const PopupMenuItem(
                  value: 'IN_PROGRESS', child: Text('Jarayonda')),
              const PopupMenuItem(value: 'DONE', child: Text('Bajarilgan')),
              const PopupMenuItem(
                  value: 'CANCELLED', child: Text('Bekor qilingan')),
            ],
          ),
        ],
      ),
      body: tasksState.when(
        loading: () => const LoadingWidget(),
        error: (error, _) => AppErrorWidget(
          message: error.toString(),
          onRetry: () => ref.read(tasksProvider.notifier).refresh(),
        ),
        data: (data) {
          if (data.tasks.isEmpty) {
            return const EmptyWidget(
              message: 'Vazifalar topilmadi',
              icon: Icons.task_alt_outlined,
            );
          }
          return RefreshIndicator(
            onRefresh: () => ref
                .read(tasksProvider.notifier)
                .refresh(status: _selectedStatus),
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(16),
              itemCount: data.tasks.length + (data.hasMore ? 1 : 0),
              itemBuilder: (context, index) {
                if (index == data.tasks.length) {
                  return const Padding(
                    padding: EdgeInsets.all(16),
                    child: Center(child: CircularProgressIndicator()),
                  );
                }
                final task = data.tasks[index];
                return _TaskCard(
                  task: task,
                  onTap: () => context.go('/tasks/${task.id}'),
                  onStatusChange: (status) => ref
                      .read(tasksProvider.notifier)
                      .updateStatus(task.id, status),
                );
              },
            ),
          );
        },
      ),
    );
  }
}

class _TaskCard extends StatelessWidget {
  final dynamic task;
  final VoidCallback onTap;
  final Function(String) onStatusChange;

  const _TaskCard({
    required this.task,
    required this.onTap,
    required this.onStatusChange,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
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
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  StatusBadge(status: task.status),
                ],
              ),
              if (task.description != null) ...[
                const SizedBox(height: 8),
                Text(
                  task.description!,
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
                  if (task.assigneeName != null) ...[
                    const Icon(Icons.person_outline,
                        size: 14, color: AppColors.textHint),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        task.assigneeName!,
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppColors.textHint,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                  if (task.deadline != null) ...[
                    Icon(
                      Icons.schedule,
                      size: 14,
                      color: task.isOverdue
                          ? AppColors.error
                          : AppColors.textHint,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      Helpers.formatDate(task.deadline),
                      style: TextStyle(
                        fontSize: 12,
                        color: task.isOverdue
                            ? AppColors.error
                            : AppColors.textHint,
                        fontWeight: task.isOverdue
                            ? FontWeight.w600
                            : FontWeight.normal,
                      ),
                    ),
                  ],
                ],
              ),
              if (task.status != 'DONE' && task.status != 'CANCELLED') ...[
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    if (task.status == 'TODO')
                      _ActionChip(
                        label: 'Boshlash',
                        color: AppColors.info,
                        onTap: () => onStatusChange('IN_PROGRESS'),
                      ),
                    if (task.status == 'IN_PROGRESS') ...[
                      _ActionChip(
                        label: 'Bajarildi',
                        color: AppColors.success,
                        onTap: () => onStatusChange('DONE'),
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

class _ActionChip extends StatelessWidget {
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _ActionChip({
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.1),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color.withValues(alpha: 0.3)),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: color,
            fontSize: 12,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }
}
