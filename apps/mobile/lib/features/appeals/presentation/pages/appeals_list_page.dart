import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/color_constants.dart';
import '../../../../core/utils/helpers.dart';
import '../../../../shared/widgets/loading_widget.dart';
import '../../../../shared/widgets/error_widget.dart';
import '../../../../shared/widgets/empty_widget.dart';
import '../../../../shared/widgets/status_badge.dart';
import '../providers/appeals_provider.dart';

class AppealsListPage extends ConsumerStatefulWidget {
  const AppealsListPage({super.key});

  @override
  ConsumerState<AppealsListPage> createState() => _AppealsListPageState();
}

class _AppealsListPageState extends ConsumerState<AppealsListPage> {
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
      ref.read(appealsProvider.notifier).loadMore();
    }
  }

  @override
  Widget build(BuildContext context) {
    final appealsState = ref.watch(appealsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Murojaatlar'),
        actions: [
          PopupMenuButton<String?>(
            icon: const Icon(Icons.filter_list),
            onSelected: (value) {
              setState(() => _selectedStatus = value);
              ref.read(appealsProvider.notifier).refresh(status: value);
            },
            itemBuilder: (context) => [
              const PopupMenuItem(value: null, child: Text('Barchasi')),
              const PopupMenuItem(value: 'NEW', child: Text('Yangi')),
              const PopupMenuItem(
                  value: 'IN_PROGRESS', child: Text('Jarayonda')),
              const PopupMenuItem(
                  value: 'RESOLVED', child: Text('Hal qilingan')),
              const PopupMenuItem(
                  value: 'REJECTED', child: Text('Rad etilgan')),
            ],
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.go('/appeals/create'),
        backgroundColor: AppColors.primary,
        child: const Icon(Icons.add, color: Colors.white),
      ),
      body: appealsState.when(
        loading: () => const LoadingWidget(),
        error: (error, _) => AppErrorWidget(
          message: error.toString(),
          onRetry: () => ref.read(appealsProvider.notifier).refresh(),
        ),
        data: (data) {
          if (data.appeals.isEmpty) {
            return const EmptyWidget(
              message: 'Murojaatlar topilmadi',
              icon: Icons.message_outlined,
            );
          }
          return RefreshIndicator(
            onRefresh: () => ref
                .read(appealsProvider.notifier)
                .refresh(status: _selectedStatus),
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(16),
              itemCount: data.appeals.length + (data.hasMore ? 1 : 0),
              itemBuilder: (context, index) {
                if (index == data.appeals.length) {
                  return const Padding(
                    padding: EdgeInsets.all(16),
                    child: Center(child: CircularProgressIndicator()),
                  );
                }
                final appeal = data.appeals[index];
                return _AppealCard(
                  appeal: appeal,
                  onTap: () => context.go('/appeals/${appeal.id}'),
                );
              },
            ),
          );
        },
      ),
    );
  }
}

class _AppealCard extends StatelessWidget {
  final dynamic appeal;
  final VoidCallback onTap;

  const _AppealCard({required this.appeal, required this.onTap});

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
                      appeal.title,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: AppColors.textPrimary,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  StatusBadge(status: appeal.status),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                appeal.description,
                style: const TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 14,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  PriorityBadge(priority: appeal.priority),
                  const Spacer(),
                  Icon(Icons.access_time,
                      size: 14, color: AppColors.textHint),
                  const SizedBox(width: 4),
                  Text(
                    Helpers.timeAgo(appeal.createdAt),
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.textHint,
                    ),
                  ),
                ],
              ),
              if (appeal.applicantName != null) ...[
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Icon(Icons.person_outline,
                        size: 14, color: AppColors.textHint),
                    const SizedBox(width: 4),
                    Text(
                      appeal.applicantName!,
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.textHint,
                      ),
                    ),
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
