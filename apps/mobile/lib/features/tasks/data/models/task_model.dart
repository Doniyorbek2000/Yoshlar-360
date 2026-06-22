class TaskModel {
  final int id;
  final String title;
  final String? description;
  final String status;
  final String priority;
  final String? deadline;
  final String? assigneeName;
  final int? assigneeId;
  final String? creatorName;
  final String? regionName;
  final String createdAt;
  final String? updatedAt;

  TaskModel({
    required this.id,
    required this.title,
    this.description,
    required this.status,
    required this.priority,
    this.deadline,
    this.assigneeName,
    this.assigneeId,
    this.creatorName,
    this.regionName,
    required this.createdAt,
    this.updatedAt,
  });

  factory TaskModel.fromJson(Map<String, dynamic> json) {
    return TaskModel(
      id: json['id'] ?? 0,
      title: json['title'] ?? '',
      description: json['description'],
      status: json['status'] ?? 'TODO',
      priority: json['priority'] ?? 'MEDIUM',
      deadline: json['deadline'],
      assigneeName: json['assignee']?['fullName'],
      assigneeId: json['assigneeId'],
      creatorName: json['creator']?['fullName'],
      regionName: json['region']?['nameUz'],
      createdAt: json['createdAt'] ?? '',
      updatedAt: json['updatedAt'],
    );
  }

  bool get isOverdue {
    if (deadline == null) return false;
    if (status == 'DONE' || status == 'CANCELLED') return false;
    try {
      return DateTime.parse(deadline!).isBefore(DateTime.now());
    } catch (_) {
      return false;
    }
  }
}
