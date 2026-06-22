class UserModel {
  final int id;
  final String email;
  final String fullName;
  final String? phone;
  final String role;
  final bool isActive;
  final int? regionId;
  final int? districtId;
  final int? mahallaId;
  final String? regionName;
  final String? districtName;
  final String? mahallaName;
  final String? createdAt;

  UserModel({
    required this.id,
    required this.email,
    required this.fullName,
    this.phone,
    required this.role,
    this.isActive = true,
    this.regionId,
    this.districtId,
    this.mahallaId,
    this.regionName,
    this.districtName,
    this.mahallaName,
    this.createdAt,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] ?? 0,
      email: json['email'] ?? '',
      fullName: json['fullName'] ?? '',
      phone: json['phone'],
      role: json['role'] ?? 'YOUTH',
      isActive: json['isActive'] ?? true,
      regionId: json['regionId'],
      districtId: json['districtId'],
      mahallaId: json['mahallaId'],
      regionName: json['region']?['nameUz'],
      districtName: json['district']?['nameUz'],
      mahallaName: json['mahalla']?['nameUz'],
      createdAt: json['createdAt'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'fullName': fullName,
      'phone': phone,
      'role': role,
      'isActive': isActive,
      'regionId': regionId,
      'districtId': districtId,
      'mahallaId': mahallaId,
    };
  }

  bool get isAdmin => [
    'SUPER_ADMIN',
    'REPUBLIC_ADMIN',
    'REGION_ADMIN',
    'DISTRICT_ADMIN',
  ].contains(role);

  bool get isSuperAdmin => role == 'SUPER_ADMIN';
  bool get isRegionAdmin => role == 'REGION_ADMIN';
  bool get isDistrictAdmin => role == 'DISTRICT_ADMIN';
  bool get isMahallaLeader => role == 'MAHALLA_LEADER';
  bool get isYouth => role == 'YOUTH';
}
