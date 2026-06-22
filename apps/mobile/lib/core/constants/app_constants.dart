class AppConstants {
  static const String appName = 'Yoshlar 360';
  static const String appVersion = '1.0.0';

  static const int defaultPageSize = 20;

  static const List<String> roles = [
    'SUPER_ADMIN',
    'REPUBLIC_ADMIN',
    'REGION_ADMIN',
    'DISTRICT_ADMIN',
    'MAHALLA_LEADER',
    'YOUTH',
    'MODERATOR',
  ];

  static const List<String> adminRoles = [
    'SUPER_ADMIN',
    'REPUBLIC_ADMIN',
    'REGION_ADMIN',
    'DISTRICT_ADMIN',
  ];

  static const List<String> appealStatuses = [
    'NEW',
    'IN_PROGRESS',
    'RESOLVED',
    'REJECTED',
    'CLOSED',
  ];

  static const List<String> taskStatuses = [
    'TODO',
    'IN_PROGRESS',
    'DONE',
    'CANCELLED',
  ];

  static const List<String> priorities = [
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT',
  ];

  static const List<String> appealCategories = [
    'EMPLOYMENT',
    'EDUCATION',
    'HOUSING',
    'HEALTHCARE',
    'SOCIAL',
    'LEGAL',
    'OTHER',
  ];
}
