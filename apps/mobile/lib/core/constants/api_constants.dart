class ApiConstants {
  static const String baseUrl = 'http://10.0.2.2:3000/api';
  static const String prodUrl = 'https://api.yoshlar360.uz/api';

  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String refresh = '/auth/refresh';
  static const String logout = '/auth/logout';
  static const String me = '/auth/me';

  static const String dashboardSummary = '/dashboard/summary';

  static const String appeals = '/appeals';
  static const String youth = '/youth';
  static const String tasks = '/tasks';
  static const String problems = '/problems';
  static const String notifications = '/notifications';
  static const String notificationsUnread = '/notifications/unread-count';
  static const String notificationsReadAll = '/notifications/read-all';

  static const String regions = '/regions';
  static const String users = '/users';
  static const String kpi = '/kpi';
  static const String reports = '/reports';

  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);
}
