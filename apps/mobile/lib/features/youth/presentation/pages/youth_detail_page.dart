import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/color_constants.dart';
import '../../../../core/utils/helpers.dart';
import '../../../../shared/widgets/loading_widget.dart';
import '../../../../shared/widgets/error_widget.dart';
import '../providers/youth_provider.dart';

class YouthDetailPage extends ConsumerWidget {
  final int youthId;

  const YouthDetailPage({super.key, required this.youthId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final detail = ref.watch(youthDetailProvider(youthId));

    return Scaffold(
      appBar: AppBar(title: const Text('Yosh profili')),
      body: detail.when(
        loading: () => const LoadingWidget(),
        error: (error, _) => AppErrorWidget(
          message: error.toString(),
          onRetry: () => ref.invalidate(youthDetailProvider(youthId)),
        ),
        data: (youth) => SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              CircleAvatar(
                radius: 48,
                backgroundColor: AppColors.primary.withValues(alpha: 0.1),
                child: Text(
                  (youth.fullName ?? '?')[0].toUpperCase(),
                  style: const TextStyle(
                    fontSize: 36,
                    fontWeight: FontWeight.bold,
                    color: AppColors.primary,
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Text(
                youth.fullName ?? 'Noma\'lum',
                style: const TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 24),
              _Section(
                title: 'Shaxsiy ma\'lumotlar',
                children: [
                  _InfoTile(
                    icon: Icons.cake,
                    label: 'Tug\'ilgan sana',
                    value: Helpers.formatDate(youth.birthDate) ,
                  ),
                  _InfoTile(
                    icon: Icons.person,
                    label: 'Jinsi',
                    value: youth.gender ?? '-',
                  ),
                  _InfoTile(
                    icon: Icons.phone,
                    label: 'Telefon',
                    value: youth.phone ?? '-',
                  ),
                  _InfoTile(
                    icon: Icons.home,
                    label: 'Manzil',
                    value: youth.address ?? '-',
                  ),
                ],
              ),
              const SizedBox(height: 16),
              _Section(
                title: 'Hudud',
                children: [
                  _InfoTile(
                    icon: Icons.location_on,
                    label: 'Viloyat',
                    value: youth.regionName ?? '-',
                  ),
                  _InfoTile(
                    icon: Icons.location_city,
                    label: 'Tuman',
                    value: youth.districtName ?? '-',
                  ),
                  _InfoTile(
                    icon: Icons.house,
                    label: 'Mahalla',
                    value: youth.mahallaName ?? '-',
                  ),
                ],
              ),
              const SizedBox(height: 16),
              _Section(
                title: 'Ta\'lim va bandlik',
                children: [
                  _InfoTile(
                    icon: Icons.school,
                    label: 'Ta\'lim',
                    value: youth.educationLevel ?? '-',
                  ),
                  _InfoTile(
                    icon: Icons.work,
                    label: 'Bandlik',
                    value: youth.employmentStatus ?? '-',
                  ),
                  _InfoTile(
                    icon: Icons.people,
                    label: 'Ijtimoiy holat',
                    value: youth.socialStatus ?? '-',
                  ),
                ],
              ),
              if (youth.skills != null || youth.interests != null) ...[
                const SizedBox(height: 16),
                _Section(
                  title: 'Qo\'shimcha',
                  children: [
                    if (youth.skills != null)
                      _InfoTile(
                        icon: Icons.star,
                        label: 'Ko\'nikmalar',
                        value: youth.skills!,
                      ),
                    if (youth.interests != null)
                      _InfoTile(
                        icon: Icons.interests,
                        label: 'Qiziqishlar',
                        value: youth.interests!,
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

class _Section extends StatelessWidget {
  final String title;
  final List<Widget> children;

  const _Section({required this.title, required this.children});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 12),
            ...children,
          ],
        ),
      ),
    );
  }
}

class _InfoTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _InfoTile({
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
          Icon(icon, size: 20, color: AppColors.primary),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  label,
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textHint,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: AppColors.textPrimary,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
