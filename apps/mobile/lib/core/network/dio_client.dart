import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../constants/api_constants.dart';
import '../storage/local_storage.dart';

final dioProvider = Provider<Dio>((ref) {
  final dio = Dio(BaseOptions(
    baseUrl: ApiConstants.baseUrl,
    connectTimeout: ApiConstants.connectTimeout,
    receiveTimeout: ApiConstants.receiveTimeout,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  ));

  dio.interceptors.add(AuthInterceptor(dio));
  dio.interceptors.add(LogInterceptor(
    requestBody: true,
    responseBody: true,
    logPrint: (obj) => print(obj),
  ));

  return dio;
});

class AuthInterceptor extends Interceptor {
  final Dio _dio;
  bool _isRefreshing = false;
  final List<RequestOptions> _pendingRequests = [];

  AuthInterceptor(this._dio);

  @override
  void onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final token = await LocalStorage.getAccessToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401 && !_isRefreshing) {
      _isRefreshing = true;
      _pendingRequests.add(err.requestOptions);

      try {
        final refreshToken = await LocalStorage.getRefreshToken();
        if (refreshToken == null) {
          await _logout();
          handler.reject(err);
          return;
        }

        final response = await _dio.post(
          ApiConstants.refresh,
          data: {'refreshToken': refreshToken},
          options: Options(headers: {'Authorization': ''}),
        );

        final data = response.data['data'];
        await LocalStorage.setAccessToken(data['accessToken']);
        await LocalStorage.setRefreshToken(data['refreshToken']);

        for (final request in _pendingRequests) {
          request.headers['Authorization'] = 'Bearer ${data['accessToken']}';
          final retryResponse = await _dio.fetch(request);
          handler.resolve(retryResponse);
        }
        _pendingRequests.clear();
      } catch (e) {
        await _logout();
        handler.reject(err);
      } finally {
        _isRefreshing = false;
      }
    } else {
      handler.next(err);
    }
  }

  Future<void> _logout() async {
    await LocalStorage.clearTokens();
  }
}
