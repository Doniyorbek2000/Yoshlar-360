import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/api_constants.dart';
import '../../../../core/network/api_exception.dart';
import '../../../../core/network/dio_client.dart';
import '../../data/models/dashboard_model.dart';

final dashboardProvider =
    AsyncNotifierProvider<DashboardNotifier, DashboardSummary>(
  DashboardNotifier.new,
);

class DashboardNotifier extends AsyncNotifier<DashboardSummary> {
  @override
  Future<DashboardSummary> build() => fetchDashboard();

  Future<DashboardSummary> fetchDashboard() async {
    final dio = ref.read(dioProvider);
    try {
      final response = await dio.get(ApiConstants.dashboardSummary);
      return DashboardSummary.fromJson(response.data['data']);
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(fetchDashboard);
  }
}
