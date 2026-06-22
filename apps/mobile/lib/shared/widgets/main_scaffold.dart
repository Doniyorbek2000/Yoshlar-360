import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/constants/color_constants.dart';
import '../../features/auth/presentation/providers/auth_provider.dart';
import '../../features/notifications/presentation/providers/notification_provider.dart';

class MainScaffold extends ConsumerWidget {
  final Widget child;

  const MainScaffold({super.key, required this.child});

  int _getIndex(String location) {
    if (location.startsWith('/dashboard')) return 0;
    if (location.startsWith('/appeals')) return 1;
    if (location.startsWith('/tasks') ||
        location.startsWith('/youth') ||
        location.startsWith('/problems')) return 2;
    if (location.startsWith('/notifications')) return 3;
    if (location.startsWith('/profile') ||
        location.startsWith('/settings')) return 4;
    return 0;
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final location = GoRouterState.of(context).uri.path;
    final currentIndex = _getIndex(location);
    final user = ref.watch(currentUserProvider);
    final unreadCount = ref.watch(unreadCountProvider);

    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: currentIndex,
        onDestinationSelected: (index) {
          switch (index) {
            case 0:
              context.go('/dashboard');
              break;
            case 1:
              context.go('/appeals');
              break;
            case 2:
              if (user?.isAdmin ?? false) {
                context.go('/youth');
              } else {
                context.go('/tasks');
              }
              break;
            case 3:
              context.go('/notifications');
              break;
            case 4:
              context.go('/profile');
              break;
          }
        },
        destinations: [
          const NavigationDestination(
            icon: Icon(Icons.dashboard_outlined),
            selectedIcon: Icon(Icons.dashboard),
            label: 'Bosh sahifa',
          ),
          const NavigationDestination(
            icon: Icon(Icons.message_outlined),
            selectedIcon: Icon(Icons.message),
            label: 'Murojaatlar',
          ),
          NavigationDestination(
            icon: Icon(
              (user?.isAdmin ?? false)
                  ? Icons.people_outline
                  : Icons.task_alt_outlined,
            ),
            selectedIcon: Icon(
              (user?.isAdmin ?? false) ? Icons.people : Icons.task_alt,
            ),
            label: (user?.isAdmin ?? false) ? 'Yoshlar' : 'Vazifalar',
          ),
          NavigationDestination(
            icon: Badge(
              isLabelVisible: unreadCount > 0,
              label: Text('$unreadCount'),
              child: const Icon(Icons.notifications_outlined),
            ),
            selectedIcon: Badge(
              isLabelVisible: unreadCount > 0,
              label: Text('$unreadCount'),
              child: const Icon(Icons.notifications),
            ),
            label: 'Bildirishnoma',
          ),
          const NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person),
            label: 'Profil',
          ),
        ],
      ),
    );
  }
}
