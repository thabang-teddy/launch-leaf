import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../core/constants/app_colors.dart';
import '../../providers/auth_provider.dart';

/// Shared sidebar content used by both the Drawer (narrow) and the
/// permanent sidebar (wide). Wrap in [Drawer] or a plain Container.
class SidebarNav extends StatelessWidget {
  const SidebarNav({super.key, this.onItemTap});

  /// Called after a nav item is tapped (e.g. to close the drawer).
  final VoidCallback? onItemTap;

  static const _items = [
    _NavDef('Dashboard', Icons.dashboard_outlined, Icons.dashboard, '/dashboard'),
    _NavDef('Notes', Icons.note_outlined, Icons.note, '/notes'),
    _NavDef('Tasks', Icons.check_circle_outline, Icons.check_circle, '/tasks'),
    _NavDef('Messages', Icons.mail_outline, Icons.mail, '/contact'),
    _NavDef('Kanban', Icons.view_kanban_outlined, Icons.view_kanban, '/kanban'),
  ];

  @override
  Widget build(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;
    final email = context.watch<AuthProvider>().userEmail ?? '';
    final initial = email.isNotEmpty ? email[0].toUpperCase() : 'U';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _Header(initial: initial),
        const Divider(color: Colors.white12, height: 1, thickness: 1),
        const SizedBox(height: 8),
        for (final item in _items)
          _NavTile(
            item: item,
            active: location.startsWith(item.path),
            onTap: () {
              onItemTap?.call();
              context.go(item.path);
            },
          ),
        const Spacer(),
        const Divider(color: Colors.white12, height: 1, thickness: 1),
        _LogoutTile(onBeforeTap: onItemTap),
        const SizedBox(height: 8),
      ],
    );
  }
}

// ── Header ────────────────────────────────────────────────────────────────────

class _Header extends StatelessWidget {
  const _Header({required this.initial});
  final String initial;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 16),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: AppColors.accent,
            radius: 20,
            child: Text(
              initial,
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
          ),
          const SizedBox(width: 12),
          const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'LaunchLeaf',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                'Dashboard',
                style: TextStyle(color: Colors.white54, fontSize: 11),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ── Nav tile ──────────────────────────────────────────────────────────────────

class _NavTile extends StatelessWidget {
  const _NavTile({
    required this.item,
    required this.active,
    required this.onTap,
  });

  final _NavDef item;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
      decoration: BoxDecoration(
        color: active ? AppColors.accent.withAlpha(35) : Colors.transparent,
        borderRadius: BorderRadius.circular(8),
      ),
      child: ListTile(
        dense: true,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        leading: Icon(
          active ? item.activeIcon : item.icon,
          color: active ? AppColors.accent : Colors.white54,
          size: 20,
        ),
        title: Text(
          item.label,
          style: TextStyle(
            color: active ? Colors.white : Colors.white70,
            fontSize: 13,
            fontWeight: active ? FontWeight.w600 : FontWeight.w400,
          ),
        ),
        onTap: onTap,
      ),
    );
  }
}

// ── Logout tile ───────────────────────────────────────────────────────────────

class _LogoutTile extends StatelessWidget {
  const _LogoutTile({this.onBeforeTap});
  final VoidCallback? onBeforeTap;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
      child: ListTile(
        dense: true,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        leading:
            const Icon(Icons.logout, color: AppColors.accent, size: 20),
        title: const Text(
          'Sign Out',
          style: TextStyle(color: Colors.white70, fontSize: 13),
        ),
        onTap: () async {
          onBeforeTap?.call();
          final confirmed = await showDialog<bool>(
            context: context,
            builder: (ctx) => AlertDialog(
              title: const Text('Sign Out'),
              content: const Text('Are you sure you want to sign out?'),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(ctx, false),
                  child: const Text('Cancel'),
                ),
                TextButton(
                  onPressed: () => Navigator.pop(ctx, true),
                  style: TextButton.styleFrom(
                    foregroundColor: AppColors.accent,
                  ),
                  child: const Text('Sign Out'),
                ),
              ],
            ),
          );
          if (confirmed == true && context.mounted) {
            await context.read<AuthProvider>().logout();
            if (context.mounted) context.go('/login');
          }
        },
      ),
    );
  }
}

// ── Data class ────────────────────────────────────────────────────────────────

class _NavDef {
  const _NavDef(this.label, this.icon, this.activeIcon, this.path);
  final String label;
  final IconData icon;
  final IconData activeIcon;
  final String path;
}
