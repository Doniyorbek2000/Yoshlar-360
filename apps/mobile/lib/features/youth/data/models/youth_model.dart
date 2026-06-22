class YouthModel {
  final int id;
  final int userId;
  final String? fullName;
  final String? birthDate;
  final String? gender;
  final String? phone;
  final String? address;
  final String? educationLevel;
  final String? employmentStatus;
  final String? socialStatus;
  final String? skills;
  final String? interests;
  final String? regionName;
  final String? districtName;
  final String? mahallaName;
  final String? createdAt;

  YouthModel({
    required this.id,
    required this.userId,
    this.fullName,
    this.birthDate,
    this.gender,
    this.phone,
    this.address,
    this.educationLevel,
    this.employmentStatus,
    this.socialStatus,
    this.skills,
    this.interests,
    this.regionName,
    this.districtName,
    this.mahallaName,
    this.createdAt,
  });

  factory YouthModel.fromJson(Map<String, dynamic> json) {
    return YouthModel(
      id: json['id'] ?? 0,
      userId: json['userId'] ?? 0,
      fullName: json['user']?['fullName'] ?? json['fullName'],
      birthDate: json['birthDate'],
      gender: json['gender'],
      phone: json['user']?['phone'] ?? json['phone'],
      address: json['address'],
      educationLevel: json['educationLevel'],
      employmentStatus: json['employmentStatus'],
      socialStatus: json['socialStatus'],
      skills: json['skills'],
      interests: json['interests'],
      regionName: json['region']?['nameUz'],
      districtName: json['district']?['nameUz'],
      mahallaName: json['mahalla']?['nameUz'],
      createdAt: json['createdAt'],
    );
  }
}
