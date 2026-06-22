import 'package:dio/dio.dart';

class ApiException implements Exception {
  final String message;
  final int? statusCode;
  final dynamic data;

  ApiException({
    required this.message,
    this.statusCode,
    this.data,
  });

  factory ApiException.fromDioError(DioException error) {
    String message;
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
        message = 'Ulanish vaqti tugadi';
        break;
      case DioExceptionType.sendTimeout:
        message = "So'rov yuborish vaqti tugadi";
        break;
      case DioExceptionType.receiveTimeout:
        message = 'Javob kutish vaqti tugadi';
        break;
      case DioExceptionType.badResponse:
        message = _handleBadResponse(error.response);
        break;
      case DioExceptionType.cancel:
        message = "So'rov bekor qilindi";
        break;
      case DioExceptionType.connectionError:
        message = 'Internet aloqasi yo\'q';
        break;
      default:
        message = 'Kutilmagan xatolik yuz berdi';
    }
    return ApiException(
      message: message,
      statusCode: error.response?.statusCode,
      data: error.response?.data,
    );
  }

  static String _handleBadResponse(Response? response) {
    if (response == null) return 'Server javob bermadi';

    final data = response.data;
    if (data is Map<String, dynamic> && data['message'] != null) {
      return data['message'].toString();
    }

    switch (response.statusCode) {
      case 400:
        return "Noto'g'ri so'rov";
      case 401:
        return 'Avtorizatsiya xatosi';
      case 403:
        return 'Ruxsat berilmagan';
      case 404:
        return 'Topilmadi';
      case 409:
        return 'Conflict xatosi';
      case 422:
        return "Ma'lumotlar noto'g'ri";
      case 429:
        return "Ko'p so'rov yuborildi, biroz kuting";
      case 500:
        return 'Server xatosi';
      default:
        return 'Xatolik: ${response.statusCode}';
    }
  }

  @override
  String toString() => message;
}
