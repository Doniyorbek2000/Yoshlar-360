import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/presentation/providers/auth_provider.dart';
import '../../features/auth/presentation/pages/login_page.dart';
import '../../features/auth/presentation/pages/register_page.dart';
import '../../features/auth/presentation/pages/splash_page.dart';
import '../../features/auth/presentation/pages/onboarding_page.dart';
import '../../features/dashboard/presentation/pages/dashboard_page.dart';
import '../../features/appeals/presentation/pages/appeals_list_page.dart';
import '../../features/appeals/presentation/pages/appeal_detail_page.dart';
import '../../features/appeals/presentation/pages/create_appeal_page.dart';
import '../../features/youth/presentation/pages/youth_list_page.dart';
import '../../features/youth/presentation/pages/youth_detail_page.dart';
import '../../features/tasks/presentation/pages/tasks_list_page.dart';
import '../../features/tasks/presentation/pages/task_detail_page.dart';
import '../../features/problems/presentation/pages/problems_list_page.dart';
import '../../features/notifications/presentation/pages/notifications_page.dart';
import '../../features/profile/presentation/pages/profile_page.dart';
import '../../features/settings/presentation/pages/settings_page.dart';
import '../../shared/widgets/main_scaffold.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authStateProvider);

  return GoRouter(
    initialLocation: '/splash',
    redirect: (context, state) {
      final isAuthenticated = authState.isAuthenticated;
      final isLoading = authState.isLoading;
      final currentPath = state.uri.path;

      final publicPaths = ['/splash', '/onboarding', '/login', '/register'];
      final isPublicPath = publicPaths.contains(currentPath);

      if (isLoading) return null;
      if (!isAuthenticated && !isPublicPath) return '/login';
      if (isAuthenticated && isPublicPath) return '/dashboard';

      return null;
    },
    routes: [
      GoRoute(
        path: '/splash',
        builder: (context, state) => const SplashPage(),
      ),
      GoRoute(
        path: '/onboarding',
        builder: (context, state) => const OnboardingPage(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginPage(),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterPage(),
      ),
      ShellRoute(
        builder: (context, state, child) => MainScaffold(child: child),
        routes: [
          GoRoute(
            path: '/dashboard',
            builder: (context, state) => const DashboardPage(),
          ),
          GoRoute(
            path: '/appeals',
            builder: (context, state) => const AppealsListPage(),
            routes: [
              GoRoute(
                path: 'create',
                builder: (context, state) => const CreateAppealPage(),
              ),
              GoRoute(
                path: ':id',
                builder: (context, state) {
                  final id = int.parse(state.pathParameters['id']!);
                  return AppealDetailPage(appealId: id);
                },
              ),
            ],
          ),
          GoRoute(
            path: '/youth',
            builder: (context, state) => const YouthListPage(),
            routes: [
              GoRoute(
                path: ':id',
                builder: (context, state) {
                  final id = int.parse(state.pathParameters['id']!);
                  return YouthDetailPage(youthId: id);
                },
              ),
            ],
          ),
          GoRoute(
            path: '/tasks',
            builder: (context, state) => const TasksListPage(),
            routes: [
              GoRoute(
                path: ':id',
                builder: (context, state) {
                  final id = int.parse(state.pathParameters['id']!);
                  return TaskDetailPage(taskId: id);
                },
              ),
            ],
          ),
          GoRoute(
            path: '/problems',
            builder: (context, state) => const ProblemsListPage(),
          ),
          GoRoute(
            path: '/notifications',
            builder: (context, state) => const NotificationsPage(),
          ),
          GoRoute(
            path: '/profile',
            builder: (context, state) => const ProfilePage(),
          ),
          GoRoute(
            path: '/settings',
            builder: (context, state) => const SettingsPage(),
          ),
        ],
      ),
    ],
  );
});
