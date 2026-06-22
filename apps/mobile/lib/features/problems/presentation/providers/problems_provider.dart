import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/api_constants.dart';
import '../../../../core/network/api_exception.dart';
import '../../../../core/network/dio_client.dart';
import '../../data/models/problem_model.dart';

final problemsProvider =
    AsyncNotifierProvider<ProblemsNotifier, List<ProblemModel>>(
  ProblemsNotifier.new,
);

class ProblemsNotifier extends AsyncNotifier<List<ProblemModel>> {
  @override
  Future<List<ProblemModel>> build() => fetchProblems();

  Future<List<ProblemModel>> fetchProblems() async {
    final dio = ref.read(dioProvider);
    try {
      final response = await dio.get(ApiConstants.problems);
      final data = response.data['data'];

      if (data is Map<String, dynamic>) {
        return (data['data'] as List?)
                ?.map((e) => ProblemModel.fromJson(e))
                .toList() ??
            [];
      } else if (data is List) {
        return data.map((e) => ProblemModel.fromJson(e)).toList();
      }
      return [];
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(fetchProblems);
  }
}
