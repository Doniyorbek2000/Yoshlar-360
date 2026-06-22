import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/api_constants.dart';
import '../../../../core/network/api_exception.dart';
import '../../../../core/network/dio_client.dart';
import '../../data/models/appeal_model.dart';

final appealsProvider =
    AsyncNotifierProvider<AppealsNotifier, AppealsState>(AppealsNotifier.new);

final appealDetailProvider =
    FutureProvider.family<AppealModel, int>((ref, id) async {
  final dio = ref.read(dioProvider);
  try {
    final response = await dio.get('${ApiConstants.appeals}/$id');
    return AppealModel.fromJson(response.data['data']);
  } on DioException catch (e) {
    throw ApiException.fromDioError(e);
  }
});

class AppealsState {
  final List<AppealModel> appeals;
  final int total;
  final int page;
  final bool hasMore;
  final String? statusFilter;

  const AppealsState({
    this.appeals = const [],
    this.total = 0,
    this.page = 1,
    this.hasMore = true,
    this.statusFilter,
  });

  AppealsState copyWith({
    List<AppealModel>? appeals,
    int? total,
    int? page,
    bool? hasMore,
    String? statusFilter,
  }) {
    return AppealsState(
      appeals: appeals ?? this.appeals,
      total: total ?? this.total,
      page: page ?? this.page,
      hasMore: hasMore ?? this.hasMore,
      statusFilter: statusFilter ?? this.statusFilter,
    );
  }
}

class AppealsNotifier extends AsyncNotifier<AppealsState> {
  @override
  Future<AppealsState> build() => _fetch(1);

  Future<AppealsState> _fetch(int page, {String? status}) async {
    final dio = ref.read(dioProvider);
    try {
      final params = <String, dynamic>{
        'page': page,
        'limit': 20,
      };
      if (status != null) params['status'] = status;

      final response =
          await dio.get(ApiConstants.appeals, queryParameters: params);
      final data = response.data['data'];

      List<AppealModel> appeals;
      int total;

      if (data is Map<String, dynamic>) {
        appeals = (data['data'] as List?)
                ?.map((e) => AppealModel.fromJson(e))
                .toList() ??
            [];
        total = data['total'] ?? 0;
      } else if (data is List) {
        appeals = data.map((e) => AppealModel.fromJson(e)).toList();
        total = appeals.length;
      } else {
        appeals = [];
        total = 0;
      }

      final currentAppeals =
          page > 1 ? (state.valueOrNull?.appeals ?? []) : <AppealModel>[];

      return AppealsState(
        appeals: [...currentAppeals, ...appeals],
        total: total,
        page: page,
        hasMore: appeals.length >= 20,
        statusFilter: status,
      );
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<void> refresh({String? status}) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() => _fetch(1, status: status));
  }

  Future<void> loadMore() async {
    final current = state.valueOrNull;
    if (current == null || !current.hasMore) return;
    state = await AsyncValue.guard(
        () => _fetch(current.page + 1, status: current.statusFilter));
  }

  Future<void> createAppeal(Map<String, dynamic> data) async {
    final dio = ref.read(dioProvider);
    try {
      await dio.post(ApiConstants.appeals, data: data);
      await refresh();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<void> updateStatus(int id, String status) async {
    final dio = ref.read(dioProvider);
    try {
      await dio.put('${ApiConstants.appeals}/$id/status',
          data: {'status': status});
      await refresh();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<void> addComment(int id, String text) async {
    final dio = ref.read(dioProvider);
    try {
      await dio
          .post('${ApiConstants.appeals}/$id/comments', data: {'text': text});
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }
}
