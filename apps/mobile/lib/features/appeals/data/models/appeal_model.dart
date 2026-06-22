class AppealModel {
  final int id;
  final String title;
  final String description;
  final String category;
  final String priority;
  final String status;
  final int? regionId;
  final int? districtId;
  final int? mahallaId;
  final String? regionName;
  final String? districtName;
  final String? mahallaName;
  final String? applicantName;
  final int? applicantId;
  final String? assigneeName;
  final List<AppealComment> comments;
  final String createdAt;
  final String? updatedAt;

  AppealModel({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.priority,
    required this.status,
    this.regionId,
    this.districtId,
    this.mahallaId,
    this.regionName,
    this.districtName,
    this.mahallaName,
    this.applicantName,
    this.applicantId,
    this.assigneeName,
    this.comments = const [],
    required this.createdAt,
    this.updatedAt,
  });

  factory AppealModel.fromJson(Map<String, dynamic> json) {
    return AppealModel(
      id: json['id'] ?? 0,
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      category: json['category'] ?? 'OTHER',
      priority: json['priority'] ?? 'MEDIUM',
      status: json['status'] ?? 'NEW',
      regionId: json['regionId'],
      districtId: json['districtId'],
      mahallaId: json['mahallaId'],
      regionName: json['region']?['nameUz'],
      districtName: json['district']?['nameUz'],
      mahallaName: json['mahalla']?['nameUz'],
      applicantName: json['applicant']?['fullName'],
      applicantId: json['applicantId'],
      assigneeName: json['assignee']?['fullName'],
      comments: (json['comments'] as List?)
              ?.map((c) => AppealComment.fromJson(c))
              .toList() ??
          [],
      createdAt: json['createdAt'] ?? '',
      updatedAt: json['updatedAt'],
    );
  }
}

class AppealComment {
  final int id;
  final String text;
  final String? authorName;
  final String createdAt;

  AppealComment({
    required this.id,
    required this.text,
    this.authorName,
    required this.createdAt,
  });

  factory AppealComment.fromJson(Map<String, dynamic> json) {
    return AppealComment(
      id: json['id'] ?? 0,
      text: json['text'] ?? '',
      authorName: json['author']?['fullName'],
      createdAt: json['createdAt'] ?? '',
    );
  }
}
