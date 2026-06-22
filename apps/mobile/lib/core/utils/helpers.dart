import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../constants/color_constants.dart';

class Helpers {
  static String formatDate(String? dateStr) {
    if (dateStr == null) return '';
    try {
      final date = DateTime.parse(dateStr);
      return DateFormat('dd.MM.yyyy').format(date);
    } catch (_) {
      return dateStr;
    }
  }

  static String formatDateTime(String? dateStr) {
    if (dateStr == null) return '';
    try {
      final date = DateTime.parse(dateStr);
      return DateFormat('dd.MM.yyyy HH:mm').format(date);
    } catch (_) {
      return dateStr;
    }
  }

  static String timeAgo(String? dateStr) {
    if (dateStr == null) return '';
    try {
      final date = DateTime.parse(dateStr);
      final now = DateTime.now();
      final diff = now.difference(date);

      if (diff.inDays > 365) return '${diff.inDays ~/ 365} yil oldin';
      if (diff.inDays > 30) return '${diff.inDays ~/ 30} oy oldin';
      if (diff.inDays > 0) return '${diff.inDays} kun oldin';
      if (diff.inHours > 0) return '${diff.inHours} soat oldin';
      if (diff.inMinutes > 0) return '${diff.inMinutes} daqiqa oldin';
      return 'Hozirgina';
    } catch (_) {
      return dateStr;
    }
  }

  static Color getStatusColor(String status) {
    switch (status.toUpperCase()) {
      case 'NEW':
        return AppColors.statusNew;
      case 'IN_PROGRESS':
        return AppColors.statusInProgress;
      case 'RESOLVED':
      case 'DONE':
        return AppColors.statusResolved;
      case 'REJECTED':
      case 'CANCELLED':
        return AppColors.statusRejected;
      case 'CLOSED':
        return AppColors.statusClosed;
      default:
        return AppColors.textSecondary;
    }
  }

  static Color getPriorityColor(String priority) {
    switch (priority.toUpperCase()) {
      case 'LOW':
        return AppColors.priorityLow;
      case 'MEDIUM':
        return AppColors.priorityMedium;
      case 'HIGH':
        return AppColors.priorityHigh;
      case 'URGENT':
        return AppColors.priorityUrgent;
      default:
        return AppColors.textSecondary;
    }
  }

  static String getStatusLabel(String status) {
    switch (status.toUpperCase()) {
      case 'NEW':
        return 'Yangi';
      case 'IN_PROGRESS':
        return 'Jarayonda';
      case 'RESOLVED':
        return 'Hal qilingan';
      case 'REJECTED':
        return 'Rad etilgan';
      case 'CLOSED':
        return 'Yopilgan';
      case 'TODO':
        return 'Bajarilmagan';
      case 'DONE':
        return 'Bajarilgan';
      case 'CANCELLED':
        return 'Bekor qilingan';
      default:
        return status;
    }
  }

  static String getPriorityLabel(String priority) {
    switch (priority.toUpperCase()) {
      case 'LOW':
        return 'Past';
      case 'MEDIUM':
        return 'O\'rta';
      case 'HIGH':
        return 'Yuqori';
      case 'URGENT':
        return 'Shoshilinch';
      default:
        return priority;
    }
  }

  static String getRoleLabel(String role) {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'Super Admin';
      case 'REPUBLIC_ADMIN':
        return 'Respublika Admin';
      case 'REGION_ADMIN':
        return 'Viloyat Admin';
      case 'DISTRICT_ADMIN':
        return 'Tuman Admin';
      case 'MAHALLA_LEADER':
        return 'Mahalla yetakchisi';
      case 'YOUTH':
        return 'Yoshlar';
      case 'MODERATOR':
        return 'Moderator';
      default:
        return role;
    }
  }

  static bool isAdmin(String role) {
    return [
      'SUPER_ADMIN',
      'REPUBLIC_ADMIN',
      'REGION_ADMIN',
      'DISTRICT_ADMIN',
    ].contains(role);
  }

  static void showSnackBar(BuildContext context, String message, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError ? AppColors.error : AppColors.success,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        margin: const EdgeInsets.all(16),
      ),
    );
  }
}
