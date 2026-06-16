import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../core/constants/app_colors.dart';
import '../providers/auth_provider.dart';
import '../providers/contact_provider.dart';
import '../providers/dashboard_provider.dart';
import '../providers/kanban_provider.dart';
import '../providers/notes_provider.dart';
import '../providers/tasks_provider.dart';
import '../shared/widgets/ll_stat_card.dart';
import '../shared/widgets/sync_fab.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<DashboardProvider>().loadStats();
    });
  }

  Future<void> _handleSync() async {
    final dashboard = context.read<DashboardProvider>();
    final notes = context.read<NotesProvider>();
    final tasks = context.read<TasksProvider>();
    final contacts = context.read<ContactProvider>();
    final kanban = context.read<KanbanProvider>();

    await dashboard.syncAll(
      onNotesRefresh: notes.loadNotes,
      onTasksRefresh: tasks.loadTasks,
      onContactsRefresh: contacts.loadContacts,
      onKanbanRefresh: kanban.loadBoards,
    );
  }

  Future<void> _handleLogout() async {
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
            style: TextButton.styleFrom(foregroundColor: AppColors.accent),
            child: const Text('Sign Out'),
          ),
        ],
      ),
    );

    if (confirmed == true && mounted) {
      await context.read<AuthProvider>().logout();
      if (mounted) context.go('/login');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Dashboard'),
        actions: [
          Consumer<DashboardProvider>(
            builder: (context, dashboard, _) => SyncFab(
              onSync: _handleSync,
              isSyncing: dashboard.isSyncing,
            ),
          ),
          const SizedBox(width: 8),
          PopupMenuButton<String>(
            icon: const Icon(Icons.more_vert),
            onSelected: (value) {
              if (value == 'logout') _handleLogout();
            },
            itemBuilder: (_) => [
              const PopupMenuItem(
                value: 'logout',
                child: Row(
                  children: [
                    Icon(Icons.logout, size: 18, color: AppColors.accent),
                    SizedBox(width: 8),
                    Text('Sign Out'),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: Consumer<DashboardProvider>(
        builder: (context, dashboard, _) {
          if (dashboard.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }
          return RefreshIndicator(
            onRefresh: () => context.read<DashboardProvider>().loadStats(),
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (dashboard.errorMessage != null)
                    _buildErrorBanner(dashboard.errorMessage!),
                  _buildWelcomeHeader(),
                  const SizedBox(height: 24),
                  const Text(
                    'Overview',
                    style: TextStyle(
                      color: AppColors.dark,
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 12),
                  _buildStatCards(dashboard),
                  const SizedBox(height: 24),
                  const Text(
                    'Quick Access',
                    style: TextStyle(
                      color: AppColors.dark,
                      fontSize: 18,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 12),
                  _buildQuickAccess(),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildErrorBanner(String message) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.accent.withAlpha(26),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.accent.withAlpha(77)),
      ),
      child: Row(
        children: [
          const Icon(Icons.warning_amber, color: AppColors.accent, size: 18),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              message,
              style: const TextStyle(color: AppColors.accent, fontSize: 13),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWelcomeHeader() {
    return Consumer<AuthProvider>(
      builder: (context, auth, _) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Welcome back',
            style: const TextStyle(
              color: AppColors.muted,
              fontSize: 14,
            ),
          ),
          if (auth.userEmail != null)
            Text(
              auth.userEmail!,
              style: const TextStyle(
                color: AppColors.dark,
                fontSize: 20,
                fontWeight: FontWeight.bold,
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildStatCards(DashboardProvider dashboard) {
    final stats = dashboard.stats;
    return Column(
      children: [
        LlStatCard(
          title: 'Notes',
          value: '${stats.notes}',
          icon: Icons.note_outlined,
          onTap: () => context.go('/notes'),
        ),
        const SizedBox(height: 10),
        LlStatCard(
          title: 'Tasks',
          value: '${stats.tasksTotal}',
          icon: Icons.check_circle_outline,
          subtitle: '${stats.tasksPending} pending',
          onTap: () => context.go('/tasks'),
        ),
        const SizedBox(height: 10),
        LlStatCard(
          title: 'Messages',
          value: '${stats.contactsTotal}',
          icon: Icons.mail_outline,
          subtitle: '${stats.contactsPending} unread',
          onTap: () => context.go('/contact'),
        ),
        const SizedBox(height: 10),
        LlStatCard(
          title: 'Kanban Boards',
          value: '${stats.kanbanBoards}',
          icon: Icons.view_kanban_outlined,
          onTap: () => context.go('/kanban'),
        ),
      ],
    );
  }

  Widget _buildQuickAccess() {
    final items = [
      _QuickItem('Notes', Icons.note_add_outlined, '/notes'),
      _QuickItem('Tasks', Icons.add_task, '/tasks'),
      _QuickItem('Messages', Icons.mark_email_read_outlined, '/contact'),
      _QuickItem('Kanban', Icons.view_kanban_outlined, '/kanban'),
    ];

    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      crossAxisSpacing: 10,
      mainAxisSpacing: 10,
      childAspectRatio: 2.5,
      children: items
          .map(
            (item) => InkWell(
              onTap: () => context.go(item.route),
              borderRadius: BorderRadius.circular(8),
              child: Container(
                decoration: BoxDecoration(
                  color: AppColors.card,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.border),
                ),
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: Row(
                  children: [
                    Icon(item.icon, color: AppColors.accent, size: 20),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        item.label,
                        style: const TextStyle(
                          color: AppColors.dark,
                          fontSize: 14,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          )
          .toList(),
    );
  }
}

class _QuickItem {
  const _QuickItem(this.label, this.icon, this.route);
  final String label;
  final IconData icon;
  final String route;
}
