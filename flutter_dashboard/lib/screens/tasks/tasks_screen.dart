import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../core/constants/app_colors.dart';
import '../../models/task_model.dart';
import '../../providers/tasks_provider.dart';
import '../../shared/widgets/app_drawer.dart';
import '../../shared/widgets/ll_app_bar.dart';

class TasksScreen extends StatefulWidget {
  const TasksScreen({super.key});

  @override
  State<TasksScreen> createState() => _TasksScreenState();
}

class _TasksScreenState extends State<TasksScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<TasksProvider>().loadTasks();
    });
  }

  Future<void> _confirmDelete(TaskModel task) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Task'),
        content: Text('Delete "${task.title}"?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            style: TextButton.styleFrom(foregroundColor: AppColors.accent),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
    if (confirmed == true && mounted) {
      await context.read<TasksProvider>().deleteTask(task);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      drawer: const AppDrawer(),
      appBar: const LlAppBar(title: 'Tasks'),
      body: Consumer<TasksProvider>(
        builder: (context, provider, _) {
          if (provider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          return RefreshIndicator(
            onRefresh: provider.loadTasks,
            child: ListView(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 80),
              children: [
                if (provider.errorMessage != null)
                  _buildErrorBanner(provider.errorMessage!),
                _buildSection(
                  'Pending',
                  provider.pending,
                  Icons.radio_button_unchecked,
                  AppColors.accent,
                  provider,
                ),
                if (provider.done.isNotEmpty) ...[
                  const SizedBox(height: 24),
                  _buildSection(
                    'Completed',
                    provider.done,
                    Icons.check_circle_outline,
                    AppColors.success,
                    provider,
                  ),
                ],
              ],
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.push('/tasks/new'),
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildErrorBanner(String msg) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.accent.withAlpha(26),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(msg, style: const TextStyle(color: AppColors.accent, fontSize: 13)),
    );
  }

  Widget _buildSection(
    String title,
    List<TaskModel> tasks,
    IconData icon,
    Color color,
    TasksProvider provider,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, color: color, size: 18),
            const SizedBox(width: 8),
            Text(
              '$title (${tasks.length})',
              style: TextStyle(
                color: color,
                fontSize: 14,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        if (tasks.isEmpty)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 12),
            child: Text(
              title == 'Pending' ? 'All done! No pending tasks.' : 'No completed tasks yet.',
              style: const TextStyle(color: AppColors.muted, fontSize: 13),
            ),
          )
        else
          ...tasks.map((task) => _buildTaskCard(task, provider)),
      ],
    );
  }

  Widget _buildTaskCard(TaskModel task, TasksProvider provider) {
    return Dismissible(
      key: Key('task_${task.id}'),
      direction: DismissDirection.endToStart,
      onDismissed: (_) => _confirmDelete(task),
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        decoration: BoxDecoration(
          color: AppColors.accent,
          borderRadius: BorderRadius.circular(8),
        ),
        child: const Icon(Icons.delete_outline, color: Colors.white),
      ),
      child: GestureDetector(
        onTap: () => context.push('/tasks/${task.id}'),
        child: Container(
          margin: const EdgeInsets.only(bottom: 8),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          decoration: BoxDecoration(
            color: AppColors.card,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: AppColors.border),
          ),
          child: Row(
            children: [
              GestureDetector(
                onTap: () => provider.toggleTask(task),
                child: Icon(
                  task.isCompleted
                      ? Icons.check_circle
                      : Icons.radio_button_unchecked,
                  color: task.isCompleted ? AppColors.success : AppColors.muted,
                  size: 24,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      task.title,
                      style: TextStyle(
                        color: task.isCompleted ? AppColors.muted : AppColors.dark,
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                        decoration: task.isCompleted
                            ? TextDecoration.lineThrough
                            : null,
                      ),
                    ),
                    if (task.description.isNotEmpty) ...[
                      const SizedBox(height: 2),
                      Text(
                        task.description,
                        style: const TextStyle(
                          color: AppColors.muted,
                          fontSize: 12,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ],
                ),
              ),
              if (task.dueDate != null) ...[
                const SizedBox(width: 8),
                _buildDueDateChip(task.dueDate!),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDueDateChip(String dueDate) {
    String label = dueDate;
    bool isOverdue = false;
    try {
      final dt = DateTime.parse(dueDate);
      final now = DateTime.now();
      isOverdue = dt.isBefore(now);
      label = '${dt.day}/${dt.month}';
    } on Exception {
      label = dueDate;
    }

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: isOverdue ? AppColors.accent.withAlpha(26) : AppColors.background,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isOverdue ? AppColors.accent : AppColors.border,
        ),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: isOverdue ? AppColors.accent : AppColors.muted,
          fontSize: 11,
        ),
      ),
    );
  }
}
