class ProblemModel {
  final int id;
  final String title;
  final String? description;
  final String status;
  final String priority;
  final String? category;
  final String? riskLevel;
  final String? regionName;
  final String? districtName;
  final String? reporterName;
  final String? assigneeName;
  final String? location;
  final String createdAt;

  ProblemModel({
    required this.id,
    required this.title,
    this.description,
    required this.status,
    required this.priority,
    this.category,
    this.riskLevel,
    this.regionName,
    this.districtName,
    this.reporterName,
    this.assigneeName,
    this.location,
    required this.createdAt,
  });

  factory ProblemModel.fromJson(Map<String, dynamic> json) {
    return ProblemModel(
      id: json['id'] ?? 0,
      title: json['title'] ?? '',
      description: json['description'],
      status: json['status'] ?? 'OPEN',
      priority: json['priority'] ?? 'MEDIUM',
      category: json['category'],
      riskLevel: json['riskLevel'],
      regionName: json['region']?['nameUz'],
      districtName: json['district']?['nameUz'],
      reporterName: json['reporter']?['fullName'],
      assigneeName: json['assignee']?['fullName'],
      location: json['location'],
      createdAt: json['createdAt'] ?? '',
    );
  }
}
