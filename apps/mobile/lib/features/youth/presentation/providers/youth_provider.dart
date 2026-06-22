import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/api_constants.dart';
import '../../../../core/network/api_exception.dart';
import '../../../../core/network/dio_client.dart';
import '../../data/models/youth_model.dart';

final youthListProvider =
    AsyncNotifierProvider<YouthListNotifier, YouthListState>(
  YouthListNotifier.new,
);

final youthDetailProvider =
    FutureProvider.family<YouthModel, int>((ref, id) async {
  final dio = ref.read(dioProvider);
  try {
    final response = await dio.get('${ApiConstants.youth}/$id');
    return YouthModel.fromJson(response.data['data']);
  } on DioException catch (e) {
    throw ApiException.fromDioError(e);
  }
});

class YouthListState {
  final List<YouthModel> youth;
  final int total;
  final int page;
  final bool hasMore;
  final String? search;

  const YouthListState({
    this.youth = const [],
    this.total = 0,
    this.page = 1,
    this.hasMore = true,
    this.search,
  });
}

class YouthListNotifier extends AsyncNotifier<YouthListState> {
  @override
  Future<YouthListState> build() => _fetch(1);

  Future<YouthListState> _fetch(int page, {String? search}) async {
    final dio = ref.read(dioProvider);
    try {
      final params = <String, dynamic>{'page': page, 'limit': 20};
      if (search != null && search.isNotEmpty) params['search'] = search;

      final response =
          await dio.get(ApiConstants.youth, queryParameters: params);
      final data = response.data['data'];

      List<YouthModel> youthList;
      int total;

      if (data is Map<String, dynamic>) {
        youthList = (data['data'] as List?)
                ?.map((e) => YouthModel.fromJson(e))
                .toList() ??
            [];
        total = data['total'] ?? 0;
      } else if (data is List) {
        youthList = data.map((e) => YouthModel.fromJson(e)).toList();
        total = youthList.length;
      } else {
        youthList = [];
        total = 0;
      }

      final current = page > 1 ? (state.valueOrNull?.youth ?? []) : <YouthModel>[];

      return YouthListState(
        youth: [...current, ...youthList],
        total: total,
        page: page,
        hasMore: youthList.length >= 20,
        search: search,
      );
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<void> refresh({String? search}) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() => _fetch(1, search: search));
  }

  Future<void> loadMore() async {
    final current = state.valueOrNull;
    if (current == null || !current.hasMore) return;
    state = await AsyncValue.guard(
        () => _fetch(current.page + 1, search: current.search));
  }
}
