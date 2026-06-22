class NotificationModel {
  final int id;
  final String title;
  final String? body;
  final String type;
  final bool isRead;
  final String? link;
  final String createdAt;

  NotificationModel({
    required this.id,
    required this.title,
    this.body,
    required this.type,
    this.isRead = false,
    this.link,
    required this.createdAt,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['id'] ?? 0,
      title: json['title'] ?? '',
      body: json['body'] ?? json['message'],
      type: json['type'] ?? 'GENERAL',
      isRead: json['isRead'] ?? false,
      link: json['link'],
      createdAt: json['createdAt'] ?? '',
    );
  }
}
