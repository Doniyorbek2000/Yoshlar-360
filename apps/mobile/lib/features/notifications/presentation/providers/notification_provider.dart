import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/api_constants.dart';
import '../../../../core/network/api_exception.dart';
import '../../../../core/network/dio_client.dart';
import '../../data/models/notification_model.dart';

final notificationsProvider =
    AsyncNotifierProvider<NotificationsNotifier, List<NotificationModel>>(
  NotificationsNotifier.new,
);

final unreadCountProvider = StateProvider<int>((ref) => 0);

class NotificationsNotifier extends AsyncNotifier<List<NotificationModel>> {
  @override
  Future<List<NotificationModel>> build() {
    _fetchUnreadCount();
    return fetchNotifications();
  }

  Future<List<NotificationModel>> fetchNotifications() async {
    final dio = ref.read(dioProvider);
    try {
      final response = await dio.get(ApiConstants.notifications);
      final data = response.data['data'];

      if (data is List) {
        return data.map((e) => NotificationModel.fromJson(e)).toList();
      }
      if (data is Map<String, dynamic> && data['data'] is List) {
        return (data['data'] as List)
            .map((e) => NotificationModel.fromJson(e))
            .toList();
      }
      return [];
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<void> _fetchUnreadCount() async {
    final dio = ref.read(dioProvider);
    try {
      final response = await dio.get(ApiConstants.notificationsUnread);
      final count = response.data['data'];
      ref.read(unreadCountProvider.notifier).state =
          count is int ? count : (count?['count'] ?? 0);
    } catch (_) {}
  }

  Future<void> refresh() async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(fetchNotifications);
    _fetchUnreadCount();
  }

  Future<void> markAsRead(int id) async {
    final dio = ref.read(dioProvider);
    try {
      await dio.put('${ApiConstants.notifications}/$id/read');
      await refresh();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }

  Future<void> markAllRead() async {
    final dio = ref.read(dioProvider);
    try {
      await dio.put(ApiConstants.notificationsReadAll);
      await refresh();
    } on DioException catch (e) {
      throw ApiException.fromDioError(e);
    }
  }
}
