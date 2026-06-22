class DashboardSummary {
  final int totalYouth;
  final int totalAppeals;
  final int newAppeals;
  final int resolvedAppeals;
  final int totalProblems;
  final int totalTasks;
  final int doneTasks;
  final int overdueTasksCount;

  DashboardSummary({
    required this.totalYouth,
    required this.totalAppeals,
    required this.newAppeals,
    required this.resolvedAppeals,
    required this.totalProblems,
    required this.totalTasks,
    required this.doneTasks,
    required this.overdueTasksCount,
  });

  factory DashboardSummary.fromJson(Map<String, dynamic> json) {
    return DashboardSummary(
      totalYouth: json['totalYouth'] ?? 0,
      totalAppeals: json['totalAppeals'] ?? 0,
      newAppeals: json['newAppeals'] ?? 0,
      resolvedAppeals: json['resolvedAppeals'] ?? 0,
      totalProblems: json['totalProblems'] ?? 0,
      totalTasks: json['totalTasks'] ?? 0,
      doneTasks: json['doneTasks'] ?? 0,
      overdueTasksCount: json['overdueTasksCount'] ?? 0,
    );
  }
}
