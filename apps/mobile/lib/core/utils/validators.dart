class Validators {
  static String? email(String? value) {
    if (value == null || value.isEmpty) return 'Email kiritilishi shart';
    final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
    if (!emailRegex.hasMatch(value)) return 'Noto\'g\'ri email format';
    return null;
  }

  static String? password(String? value) {
    if (value == null || value.isEmpty) return 'Parol kiritilishi shart';
    if (value.length < 6) return 'Parol kamida 6 belgidan iborat bo\'lishi kerak';
    return null;
  }

  static String? required(String? value, [String? fieldName]) {
    if (value == null || value.trim().isEmpty) {
      return '${fieldName ?? 'Bu maydon'} to\'ldirilishi shart';
    }
    return null;
  }

  static String? phone(String? value) {
    if (value == null || value.isEmpty) return 'Telefon raqam kiritilishi shart';
    final phoneRegex = RegExp(r'^\+?998\d{9}$');
    if (!phoneRegex.hasMatch(value.replaceAll(RegExp(r'[\s\-\(\)]'), ''))) {
      return 'Noto\'g\'ri telefon raqam';
    }
    return null;
  }
}
