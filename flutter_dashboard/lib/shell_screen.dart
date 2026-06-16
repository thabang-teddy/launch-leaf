import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import 'core/constants/app_colors.dart';

class ShellScreen extends StatelessWidget {
  const ShellScreen({super.key, required this.child});

  final Widget child;

  static const _tabs = [
    _TabItem(label: 'Dashboard', icon: Icons.dashboard_outlined, path: '/dashboard'),
    _TabItem(label: 'Notes', icon: Icons.note_outlined, path: '/notes'),
    _TabItem(label: 'Tasks', icon: Icons.check_circle_outline, path: '/tasks'),
    _TabItem(label: 'Messages', icon: Icons.mail_outline, path: '/contact'),
    _TabItem(label: 'Kanban', icon: Icons.view_kanban_outlined, path: '/kanban'),
  ];

  int _currentIndex(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;
    for (var i = 0; i < _tabs.length; i++) {
      if (location.startsWith(_tabs[i].path)) return i;
    }
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    final currentIndex = _currentIndex(context);

    return Scaffold(
      body: child,
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: currentIndex,
        onTap: (index) {
          if (index != currentIndex) {
            context.go(_tabs[index].path);
          }
        },
        selectedItemColor: AppColors.accent,
        unselectedItemColor: AppColors.muted,
        backgroundColor: AppColors.card,
        type: BottomNavigationBarType.fixed,
        selectedLabelStyle: const TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w600,
        ),
        unselectedLabelStyle: const TextStyle(fontSize: 11),
        items: _tabs
            .map(
              (tab) => BottomNavigationBarItem(
                icon: Icon(tab.icon),
                label: tab.label,
              ),
            )
            .toList(),
      ),
    );
  }
}

class _TabItem {
  const _TabItem({
    required this.label,
    required this.icon,
    required this.path,
  });

  final String label;
  final IconData icon;
  final String path;
}
