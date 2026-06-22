import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/constants/color_constants.dart';
import '../../../../core/utils/helpers.dart';
import '../../../../shared/widgets/loading_widget.dart';
import '../../../../shared/widgets/error_widget.dart';
import '../../../../shared/widgets/empty_widget.dart';
import '../providers/youth_provider.dart';

class YouthListPage extends ConsumerStatefulWidget {
  const YouthListPage({super.key});

  @override
  ConsumerState<YouthListPage> createState() => _YouthListPageState();
}

class _YouthListPageState extends ConsumerState<YouthListPage> {
  final _searchController = TextEditingController();
  final _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _searchController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      ref.read(youthListProvider.notifier).loadMore();
    }
  }

  void _onSearch(String value) {
    ref.read(youthListProvider.notifier).refresh(search: value);
  }

  @override
  Widget build(BuildContext context) {
    final youthState = ref.watch(youthListProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Yoshlar bazasi'),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchController,
              onSubmitted: _onSearch,
              decoration: InputDecoration(
                hintText: 'Qidirish...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchController.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchController.clear();
                          _onSearch('');
                        },
                      )
                    : null,
              ),
            ),
          ),
          Expanded(
            child: youthState.when(
              loading: () => const LoadingWidget(),
              error: (error, _) => AppErrorWidget(
                message: error.toString(),
                onRetry: () =>
                    ref.read(youthListProvider.notifier).refresh(),
              ),
              data: (data) {
                if (data.youth.isEmpty) {
                  return const EmptyWidget(
                    message: 'Yoshlar topilmadi',
                    icon: Icons.people_outline,
                  );
                }
                return RefreshIndicator(
                  onRefresh: () =>
                      ref.read(youthListProvider.notifier).refresh(),
                  child: ListView.builder(
                    controller: _scrollController,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: data.youth.length + (data.hasMore ? 1 : 0),
                    itemBuilder: (context, index) {
                      if (index == data.youth.length) {
                        return const Padding(
                          padding: EdgeInsets.all(16),
                          child:
                              Center(child: CircularProgressIndicator()),
                        );
                      }
                      final youth = data.youth[index];
                      return _YouthCard(
                        youth: youth,
                        onTap: () => context.go('/youth/${youth.id}'),
                      );
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _YouthCard extends StatelessWidget {
  final dynamic youth;
  final VoidCallback onTap;

  const _YouthCard({required this.youth, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        onTap: onTap,
        leading: CircleAvatar(
          backgroundColor: AppColors.primary.withValues(alpha: 0.1),
          child: Text(
            (youth.fullName ?? '?')[0].toUpperCase(),
            style: const TextStyle(
              color: AppColors.primary,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        title: Text(
          youth.fullName ?? 'Noma\'lum',
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (youth.regionName != null)
              Text(
                '${youth.regionName}${youth.districtName != null ? ', ${youth.districtName}' : ''}',
                style: const TextStyle(fontSize: 12),
              ),
            if (youth.educationLevel != null)
              Text(
                youth.educationLevel!,
                style: const TextStyle(
                  fontSize: 12,
                  color: AppColors.textHint,
                ),
              ),
          ],
        ),
        trailing: const Icon(Icons.chevron_right),
      ),
    );
  }
}
