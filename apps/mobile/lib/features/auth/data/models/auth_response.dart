import 'user_model.dart';

class AuthResponse {
  final String accessToken;
  final String refreshToken;
  final UserModel user;

  AuthResponse({
    required this.accessToken,
    required this.refreshToken,
    required this.user,
  });

  factory AuthResponse.fromJson(Map<String, dynamic> json) {
    return AuthResponse(
      accessToken: json['accessToken'] ?? '',
      refreshToken: json['refreshToken'] ?? '',
      user: UserModel.fromJson(json['user'] ?? {}),
    );
  }
}

class LoginRequest {
  final String email;
  final String password;

  LoginRequest({required this.email, required this.password});

  Map<String, dynamic> toJson() => {
    'email': email,
    'password': password,
  };
}

class RegisterRequest {
  final String email;
  final String password;
  final String fullName;
  final String? phone;
  final int? regionId;
  final int? districtId;
  final int? mahallaId;

  RegisterRequest({
    required this.email,
    required this.password,
    required this.fullName,
    this.phone,
    this.regionId,
    this.districtId,
    this.mahallaId,
  });

  Map<String, dynamic> toJson() => {
    'email': email,
    'password': password,
    'fullName': fullName,
    if (phone != null) 'phone': phone,
    if (regionId != null) 'regionId': regionId,
    if (districtId != null) 'districtId': districtId,
    if (mahallaId != null) 'mahallaId': mahallaId,
  };
}
