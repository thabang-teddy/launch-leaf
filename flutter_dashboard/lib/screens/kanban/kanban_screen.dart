import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/constants/app_colors.dart';
import '../../models/kanban_models.dart';
import '../../providers/kanban_provider.dart';
import '../../shared/widgets/app_drawer.dart';
import '../../shell_screen.dart';

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
          if (provider.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }
          if (provider.boards.isEmpty) {
            return _buildEmptyState();
          }
          if (provider.projects.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(
                    Icons.view_kanban_outlined,
                    size: 64,
                    color: AppColors.border,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'No projects in "${provider.selectedBoard?.name ?? ''}"',
                    style: const TextStyle(color: AppColors.muted, fontSize: 15),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Sync to load your kanban data',
                    style: TextStyle(color: AppColors.muted, fontSize: 13),
                  ),
                ],
              ),
            );
          }
          return RefreshIndicator(
            onRefresh: provider.loadBoards,
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: provider.projects.length,
              itemBuilder: (_, i) => _buildProject(provider.projects[i]),
            ),
          );
        },
      ),
    );
  }

  Widget _buildBoardSelector() {
    return Consumer<KanbanProvider>(
      builder: (context, provider, _) {
        if (provider.boards.isEmpty) return const SizedBox.shrink();
        return Container(
          color: Colors.white,
          decoration: const BoxDecoration(
            border: Border(bottom: BorderSide(color: AppColors.border)),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Row(
            children: [
              const Text(
                'Board:',
                style: TextStyle(color: AppColors.muted, fontSize: 13),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<int>(
                    value: provider.selectedBoard?.id,
                    dropdownColor: Colors.white,
                    style: const TextStyle(
                      color: AppColors.dark,
                      fontSize: 14,
                    ),
                    icon: const Icon(
                      Icons.keyboard_arrow_down,
                      color: AppColors.dark,
                    ),
                    items: provider.boards.map((board) {
                      return DropdownMenuItem<int>(
                        value: board.id,
                        child: Text(
                          board.name,
                          style: const TextStyle(color: AppColors.dark),
                        ),
                      );
                    }).toList(),
                    onChanged: (id) {
                      if (id == null) return;
                      final board = provider.boards.firstWhere((b) => b.id == id);
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

  Widget _buildEmptyState() {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.view_kanban_outlined, size: 64, color: AppColors.border),
          SizedBox(height: 16),
          Text(
            'No boards found',
            style: TextStyle(color: AppColors.muted, fontSize: 16),
          ),
          SizedBox(height: 8),
          Text(
            'Use the sync button to pull your kanban data',
            style: TextStyle(color: AppColors.muted, fontSize: 13),
          ),
        ],
      ),
    );
  }

  Widget _buildProject(KanbanProject project) {
    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildProjectHeader(project),
          if (project.columns.isEmpty)
            const Padding(
              padding: EdgeInsets.all(16),
              child: Text(
                'No columns in this project',
                style: TextStyle(color: AppColors.muted, fontSize: 13),
              ),
            )
          else
            SizedBox(
              height: 280,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.fromLTRB(12, 0, 12, 12),
                itemCount: project.columns.length,
                itemBuilder: (_, i) => _buildColumn(project.columns[i]),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildProjectHeader(KanbanProject project) {
    Color accentColor = _parseColor(project.color);
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: AppColors.border)),
      ),
      child: Row(
        children: [
          Container(
            width: 12,
            height: 12,
            decoration: BoxDecoration(
              color: accentColor,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              project.name,
              style: const TextStyle(
                color: AppColors.dark,
                fontSize: 16,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          Text(
            '${project.columns.length} columns',
            style: const TextStyle(color: AppColors.muted, fontSize: 12),
          ),
        ],
      ),
    );
  }

  Widget _buildColumn(KanbanColumn column) {
    Color colColor = _parseColor(column.color);
    return Container(
      width: 200,
      margin: const EdgeInsets.only(right: 10, top: 12),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            decoration: BoxDecoration(
              color: colColor.withAlpha(26),
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(7),
                topRight: Radius.circular(7),
              ),
              border: Border(
                bottom: BorderSide(color: colColor.withAlpha(77)),
              ),
            ),
            child: Row(
              children: [
                Container(
                  width: 8,
                  height: 8,
                  decoration: BoxDecoration(
                    color: colColor,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    column.title,
                    style: const TextStyle(
                      color: AppColors.dark,
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                Text(
                  '${column.cards.length}',
                  style: const TextStyle(color: AppColors.muted, fontSize: 12),
                ),
              ],
            ),
          ),
          Expanded(
            child: column.cards.isEmpty
                ? const Center(
                    child: Text(
                      'No cards',
                      style: TextStyle(color: AppColors.muted, fontSize: 12),
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(8),
                    itemCount: column.cards.length,
                    itemBuilder: (_, i) => _buildCard(column.cards[i]),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildCard(KanbanCard card) {
    return Container(
      margin: const EdgeInsets.only(bottom: 6),
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: AppColors.card,
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(8),
            blurRadius: 2,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            card.title,
            style: const TextStyle(
              color: AppColors.dark,
              fontSize: 12,
              fontWeight: FontWeight.w500,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          if (card.description.isNotEmpty) ...[
            const SizedBox(height: 4),
            Text(
              card.description,
              style: const TextStyle(color: AppColors.muted, fontSize: 11),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
          if (card.dueDate != null) ...[
            const SizedBox(height: 6),
            Row(
              children: [
                const Icon(
                  Icons.calendar_today_outlined,
                  size: 10,
                  color: AppColors.muted,
                ),
                const SizedBox(width: 4),
                Text(
                  _formatDate(card.dueDate!),
                  style: const TextStyle(color: AppColors.muted, fontSize: 10),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  Color _parseColor(String colorStr) {
    try {
      final hex = colorStr.replaceFirst('#', '');
      if (hex.length == 6) {
        return Color(int.parse('FF$hex', radix: 16));
      }
    } on Exception {
      return AppColors.accent;
    }
    return AppColors.accent;
  }

  String _formatDate(String dateStr) {
    try {
      final dt = DateTime.parse(dateStr);
      return '${dt.day}/${dt.month}/${dt.year}';
    } on Exception {
      return dateStr;
    }
  }
}
