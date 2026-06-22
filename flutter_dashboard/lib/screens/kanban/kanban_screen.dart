import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../core/constants/app_colors.dart';
import '../../models/kanban_models.dart';
import '../../providers/kanban_provider.dart';
import '../../shared/widgets/app_drawer.dart';
import '../../shell_screen.dart';
import 'kanban_dialogs.dart';

class KanbanScreen extends StatefulWidget {
  const KanbanScreen({super.key});

  @override
  State<KanbanScreen> createState() => _KanbanScreenState();
}

class _KanbanScreenState extends State<KanbanScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<KanbanProvider>().loadBoards();
    });
  }

  @override
  Widget build(BuildContext context) {
    final isWide = MediaQuery.sizeOf(context).width >= kSidebarBreakpoint;

    return Scaffold(
      drawer: isWide ? null : const AppDrawer(),
      appBar: AppBar(
        backgroundColor: Colors.white,
        foregroundColor: AppColors.dark,
        elevation: 0,
        automaticallyImplyLeading: false,
        leading: isWide
            ? null
            : Builder(
                builder: (ctx) => IconButton(
                  icon: const Icon(Icons.menu, color: AppColors.dark),
                  onPressed: () => Scaffold.of(ctx).openDrawer(),
                ),
              ),
        title: const Text(
          'Kanban',
          style: TextStyle(
            color: AppColors.dark,
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(50),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(color: AppColors.border, height: 1),
              _buildBoardSelector(),
            ],
          ),
        ),
      ),
      body: Consumer<KanbanProvider>(
        builder: (context, provider, _) {
          if (provider.errorMessage != null) {
            WidgetsBinding.instance.addPostFrameCallback((_) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(provider.errorMessage!),
                  backgroundColor: Colors.red,
                ),
              );
              provider.clearError();
            });
          }

          if (provider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }
          if (provider.boards.isEmpty) {
            return _buildEmptyBoards();
          }
          if (provider.projects.isEmpty) {
            return _buildEmptyProjects(context, provider);
          }

          return RefreshIndicator(
            onRefresh: provider.loadBoards,
            child: ListView(
              padding: const EdgeInsets.fromLTRB(16, 20, 16, 80),
              children: [
                _buildHeader(context, provider),
                const SizedBox(height: 16),
                ...provider.projects.map((p) => _buildProjectCard(context, p)),
              ],
            ),
          );
        },
      ),
    );
  }

  // ─── Board selector ──────────────────────────────────────────────────────

  Widget _buildBoardSelector() {
    return Consumer<KanbanProvider>(
      builder: (context, provider, _) {
        if (provider.boards.isEmpty) return const SizedBox.shrink();
        return Container(
          decoration: const BoxDecoration(
            color: Colors.white,
            border: Border(bottom: BorderSide(color: AppColors.border)),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Row(
            children: [
              const Text('Board:', style: TextStyle(color: AppColors.muted, fontSize: 13)),
              const SizedBox(width: 8),
              Expanded(
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: provider.selectedBoard?.id.toString(),
                    dropdownColor: Colors.white,
                    style: const TextStyle(color: AppColors.dark, fontSize: 14),
                    icon: const Icon(Icons.keyboard_arrow_down, color: AppColors.dark),
                    items: provider.boards.map((board) {
                      return DropdownMenuItem<String>(
                        value: board.id.toString(),
                        child: Text(board.name, style: const TextStyle(color: AppColors.dark)),
                      );
                    }).toList(),
                    onChanged: (idStr) {
                      if (idStr == null) return;
                      final board = provider.boards.firstWhere(
                        (b) => b.id.toString() == idStr,
                      );
                      provider.selectBoard(board);
                    },
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  // ─── Header row ──────────────────────────────────────────────────────────

  Widget _buildHeader(BuildContext context, KanbanProvider provider) {
    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Projects',
                style: TextStyle(
                  color: AppColors.dark,
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                ),
              ),
              Text(
                '${provider.projects.length} project${provider.projects.length != 1 ? "s" : ""}',
                style: const TextStyle(color: AppColors.muted, fontSize: 13),
              ),
            ],
          ),
        ),
        GestureDetector(
          onTap: () => showProjectDialog(context),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: const Color(0xFF2DC9A2),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.add, size: 16, color: Colors.white),
                SizedBox(width: 4),
                Text(
                  'New Project',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w600,
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  // ─── Project card ─────────────────────────────────────────────────────────

  Widget _buildProjectCard(BuildContext context, KanbanProject project) {
    final accentColor = _parseColor(project.color);
    final cardCount = project.columns.fold<int>(0, (sum, col) => sum + col.cards.length);

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(10),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Colored accent bar
          Container(height: 6, color: accentColor),

          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Name row + edit/delete
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Text(
                        project.name,
                        style: const TextStyle(
                          color: AppColors.dark,
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    _iconBtn(
                      icon: Icons.edit_outlined,
                      tooltip: 'Edit project',
                      onTap: () => showProjectDialog(context, project: project),
                    ),
                    const SizedBox(width: 4),
                    _iconBtn(
                      icon: Icons.close,
                      tooltip: 'Delete project',
                      isDestructive: true,
                      onTap: () => confirmDeleteProject(context, project),
                    ),
                  ],
                ),

                // Description
                if (project.description.isNotEmpty) ...[
                  const SizedBox(height: 6),
                  Text(
                    project.description,
                    style: const TextStyle(color: AppColors.muted, fontSize: 13, height: 1.45),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],

                const SizedBox(height: 14),

                // Pills row
                Row(
                  children: [
                    _pill(
                      value: '${project.columns.length}',
                      label: 'columns',
                      valueColor: const Color(0xFF1A9A7E),
                      bgColor: const Color(0xFFE8F7F2),
                    ),
                    const SizedBox(width: 8),
                    _pill(
                      value: '$cardCount',
                      label: 'cards',
                      valueColor: const Color(0xFF4F46E5),
                      bgColor: const Color(0xFFEEF2FF),
                    ),
                  ],
                ),

                const SizedBox(height: 14),

                // Open board button
                SizedBox(
                  width: double.infinity,
                  child: TextButton(
                    onPressed: () => context.push('/kanban/board/${project.id}'),
                    style: TextButton.styleFrom(
                      backgroundColor: const Color(0xFFE8F7F2),
                      foregroundColor: const Color(0xFF1A9A7E),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                      ),
                      padding: const EdgeInsets.symmetric(vertical: 10),
                    ),
                    child: const Text(
                      'Open Board →',
                      style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ─── Empty states ─────────────────────────────────────────────────────────

  Widget _buildEmptyBoards() {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.view_kanban_outlined, size: 64, color: AppColors.border),
          SizedBox(height: 16),
          Text('No boards found', style: TextStyle(color: AppColors.muted, fontSize: 16)),
          SizedBox(height: 8),
          Text(
            'Use the sync button to pull your kanban data',
            style: TextStyle(color: AppColors.muted, fontSize: 13),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyProjects(BuildContext context, KanbanProvider provider) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                color: AppColors.background,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.border),
              ),
              child: const Icon(Icons.folder_open_outlined, size: 36, color: AppColors.muted),
            ),
            const SizedBox(height: 20),
            const Text(
              'No projects yet',
              style: TextStyle(color: AppColors.dark, fontSize: 17, fontWeight: FontWeight.w600),
            ),
            const SizedBox(height: 8),
            const Text(
              'Create a project to start organising your work.',
              style: TextStyle(color: AppColors.muted, fontSize: 14),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () => showProjectDialog(context),
              icon: const Icon(Icons.add),
              label: const Text('Create Project'),
            ),
          ],
        ),
      ),
    );
  }

  // ─── Small helpers ────────────────────────────────────────────────────────

  Widget _iconBtn({
    required IconData icon,
    required String tooltip,
    required VoidCallback onTap,
    bool isDestructive = false,
  }) {
    return Tooltip(
      message: tooltip,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(6),
        child: Container(
          width: 28,
          height: 28,
          decoration: BoxDecoration(
            color: isDestructive ? const Color(0xFFFEF2F2) : AppColors.background,
            borderRadius: BorderRadius.circular(6),
            border: Border.all(
              color: isDestructive ? const Color(0xFFFEE2E2) : AppColors.border,
            ),
          ),
          child: Icon(
            icon,
            size: 14,
            color: isDestructive ? const Color(0xFFEF4444) : AppColors.muted,
          ),
        ),
      ),
    );
  }

  Widget _pill({
    required String value,
    required String label,
    required Color valueColor,
    required Color bgColor,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(value, style: TextStyle(color: valueColor, fontSize: 13, fontWeight: FontWeight.w700)),
          const SizedBox(width: 4),
          Text(label, style: TextStyle(color: valueColor, fontSize: 11, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }

  Color _parseColor(String colorStr) {
    try {
      final hex = colorStr.replaceFirst('#', '');
      if (hex.length == 6) return Color(int.parse('FF$hex', radix: 16));
    } on Exception {
      return AppColors.accent;
    }
    return AppColors.accent;
  }
}
