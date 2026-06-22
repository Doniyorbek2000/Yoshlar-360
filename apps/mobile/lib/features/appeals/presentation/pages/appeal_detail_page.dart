import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/color_constants.dart';
import '../../../../core/utils/helpers.dart';
import '../../../../shared/widgets/loading_widget.dart';
import '../../../../shared/widgets/error_widget.dart';
import '../../../../shared/widgets/status_badge.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../providers/appeals_provider.dart';

class AppealDetailPage extends ConsumerStatefulWidget {
  final int appealId;

  const AppealDetailPage({super.key, required this.appealId});

  @override
  ConsumerState<AppealDetailPage> createState() => _AppealDetailPageState();
}

class _AppealDetailPageState extends ConsumerState<AppealDetailPage> {
  final _commentController = TextEditingController();

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  Future<void> _addComment() async {
    final text = _commentController.text.trim();
    if (text.isEmpty) return;

    try {
      await ref
          .read(appealsProvider.notifier)
          .addComment(widget.appealId, text);
      _commentController.clear();
      ref.invalidate(appealDetailProvider(widget.appealId));
      if (mounted) {
        Helpers.showSnackBar(context, 'Izoh qo\'shildi');
      }
    } catch (e) {
      if (mounted) {
        Helpers.showSnackBar(context, e.toString(), isError: true);
      }
    }
  }

  Future<void> _updateStatus(String status) async {
    try {
      await ref
          .read(appealsProvider.notifier)
          .updateStatus(widget.appealId, status);
      ref.invalidate(appealDetailProvider(widget.appealId));
      if (mounted) {
        Helpers.showSnackBar(context, 'Holat yangilandi');
      }
    } catch (e) {
      if (mounted) {
        Helpers.showSnackBar(context, e.toString(), isError: true);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final detail = ref.watch(appealDetailProvider(widget.appealId));
    final user = ref.watch(currentUserProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Murojaat'),
        actions: [
          if (user?.isAdmin ?? false)
            PopupMenuButton<String>(
              onSelected: _updateStatus,
              itemBuilder: (context) => [
                const PopupMenuItem(
                    value: 'IN_PROGRESS', child: Text('Jarayonda')),
                const PopupMenuItem(
                    value: 'RESOLVED', child: Text('Hal qilish')),
                const PopupMenuItem(
                    value: 'REJECTED', child: Text('Rad etish')),
                const PopupMenuItem(value: 'CLOSED', child: Text('Yopish')),
              ],
            ),
        ],
      ),
      body: detail.when(
        loading: () => const LoadingWidget(),
        error: (error, _) => AppErrorWidget(
          message: error.toString(),
          onRetry: () =>
              ref.invalidate(appealDetailProvider(widget.appealId)),
        ),
        data: (appeal) => Column(
          children: [
            Expanded(
              child: SingleChildScrollView(
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
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: AppColors.textPrimary,
                            ),
                          ),
                        ),
                        StatusBadge(status: appeal.status),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Text(
                      appeal.description,
                      style: const TextStyle(
                        fontSize: 15,
                        color: AppColors.textPrimary,
                        height: 1.6,
                      ),
                    ),
                    const SizedBox(height: 20),
                    _InfoRow(
                      icon: Icons.category,
                      label: 'Kategoriya',
                      value: appeal.category,
                    ),
                    _InfoRow(
                      icon: Icons.flag,
                      label: 'Muhimlik',
                      value: Helpers.getPriorityLabel(appeal.priority),
                    ),
                    if (appeal.applicantName != null)
                      _InfoRow(
                        icon: Icons.person,
                        label: 'Murojaat qiluvchi',
                        value: appeal.applicantName!,
                      ),
                    if (appeal.regionName != null)
                      _InfoRow(
                        icon: Icons.location_on,
                        label: 'Viloyat',
                        value: appeal.regionName!,
                      ),
                    if (appeal.districtName != null)
                      _InfoRow(
                        icon: Icons.location_city,
                        label: 'Tuman',
                        value: appeal.districtName!,
                      ),
                    _InfoRow(
                      icon: Icons.access_time,
                      label: 'Sana',
                      value: Helpers.formatDateTime(appeal.createdAt),
                    ),
                    const Divider(height: 32),
                    Text(
                      'Izohlar (${appeal.comments.length})',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 12),
                    if (appeal.comments.isEmpty)
                      const Padding(
                        padding: EdgeInsets.all(16),
                        child: Center(
                          child: Text(
                            'Izohlar yo\'q',
                            style: TextStyle(color: AppColors.textHint),
                          ),
                        ),
                      )
                    else
                      ...appeal.comments.map(
                        (comment) => _CommentCard(comment: comment),
                      ),
                  ],
                ),
              ),
            ),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.white,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 10,
                    offset: const Offset(0, -2),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _commentController,
                      decoration: InputDecoration(
                        hintText: 'Izoh yozing...',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(24),
                        ),
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 10,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton(
                    onPressed: _addComment,
                    icon: const Icon(Icons.send),
                    color: AppColors.primary,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _InfoRow({
    required this.icon,
    required this.label,
    required this.value,
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
            '$label: ',
            style: const TextStyle(
              color: AppColors.textSecondary,
              fontSize: 14,
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontWeight: FontWeight.w500,
                fontSize: 14,
                color: AppColors.textPrimary,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _CommentCard extends StatelessWidget {
  final dynamic comment;

  const _CommentCard({required this.comment});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.person, size: 16, color: AppColors.primary),
              const SizedBox(width: 8),
              Text(
                comment.authorName ?? 'Anonim',
                style: const TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 13,
                ),
              ),
              const Spacer(),
              Text(
                Helpers.timeAgo(comment.createdAt),
                style: const TextStyle(
                  fontSize: 12,
                  color: AppColors.textHint,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            comment.text,
            style: const TextStyle(fontSize: 14),
          ),
        ],
      ),
    );
  }
}
