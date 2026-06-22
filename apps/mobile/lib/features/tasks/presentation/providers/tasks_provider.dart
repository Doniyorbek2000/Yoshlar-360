import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/api_constants.dart';
import '../../../../core/network/api_exception.dart';
import '../../../../core/network/dio_client.dart';
import '../../data/models/task_model.dart';

final tasksProvider =
    AsyncNotifierProvider<TasksNotifier, TasksState>(TasksNotifier.new);

final taskDetailProvider =
    FutureProvider.family<TaskModel, int>((ref, id) async {
  final dio = ref.read(dioProvider);
  try {
    final response = await dio.get('${ApiConstants.tasks}/$id');
    return TaskModel.fromJson(response.data['data']);
  } on DioException catch (e) {
    throw ApiException.fromDioError(e);
  }
});

class TasksState {
  final List<TaskModel> tasks;
  final int total;
  final int page;
  final bool hasMore;
  final String? statusFilter;

  const TasksState({
    this.tasks = const [],
    this.total = 0,
    this.page = 1,
    this.hasMore = true,
    this.statusFilter,
  });
}

class TasksNotifier extends AsyncNotifier<TasksState> {
  @override
  Future<TasksState> build() => _fetch(1);

  Future<TasksState> _fetch(int page, {String? status}) async {
    final dio = ref.read(dioProvider);
    try {
      final params = <String, dynamic>{'page': page, 'limit': 20};
      if (status != null) params['status'] = status;

      final response =
          await dio.get(ApiConstants.tasks, queryParameters: params);
      final data = response.data['data'];

      List<TaskModel> taskList;
      int total;

      if (data is Map<String, dynamic>) {
        taskList = (data['data'] as List?)
                ?.map((e) => TaskModel.fromJson(e))
                .toList() ??
            [];
        total = data['total'] ?? 0;
      } else if (data is List) {
        taskList = data.map((e) => TaskModel.fromJson(e)).toList();
        total = taskList.length;
      } else {
        taskList = [];
        total = 0;
      }

      final current =
          page > 1 ? (state.valueOrNull?.tasks ?? []) : <TaskModel>[];

      return TasksState(
        tasks: [...current, ...taskList],
        total: total,
        page: page,
        hasMore: taskList.length >= 20,
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

  Future<void> updateStatus(int id, String status) async {
    final dio = ref.read(dioProvider);
    try {
      await dio
          .put('${ApiConstants.tasks}/$id/status', data: {'status': status});
      await refresh();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }
}
