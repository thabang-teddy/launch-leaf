import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../models/kanban_models.dart';
import '../../providers/kanban_provider.dart';
import 'kanban_dialogs.dart';

// Design tokens matching Laravel Board.jsx
const _kGreen     = Color(0xFF2DC9A2);
const _kGreenSoft = Color(0xFFE8F7F2);
const _kGreenText = Color(0xFF1A9A7E);
const _kBg        = Color(0xFFF0F4F3);
const _kBorder    = Color(0xFFE3EDEA);
const _kText      = Color(0xFF1B2E2B);
const _kMuted     = Color(0xFF748D8A);

// Column header colors (same keys as Board.jsx COLUMN_COLORS)
const _kColumnColors = {
  'primary'   : Color(0xFF0d6efd),
  'secondary' : Color(0xFF6c757d),
  'success'   : Color(0xFF198754),
  'danger'    : Color(0xFFdc3545),
  'warning'   : Color(0xFFffc107),
  'info'      : Color(0xFF0dcaf0),
  'dark'      : Color(0xFF212529),
};

class KanbanBoardScreen extends StatefulWidget {
  const KanbanBoardScreen({super.key, required this.projectId});
  final int projectId;

  @override
  State<KanbanBoardScreen> createState() => _KanbanBoardScreenState();
}

class _KanbanBoardScreenState extends State<KanbanBoardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final provider = context.read<KanbanProvider>();
      if (provider.boards.isEmpty) {
        provider.loadBoards();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<KanbanProvider>(
      builder: (context, provider, _) {
        final project = provider.projectById(widget.projectId);

        return Scaffold(
          backgroundColor: _kBg,
          appBar: AppBar(
            backgroundColor: Colors.white,
            foregroundColor: _kText,
            elevation: 0,
            leading: IconButton(
              icon: const Icon(Icons.arrow_back, color: _kText),
              onPressed: () => context.pop(),
            ),
            title: project == null
                ? const Text('Board',
                    style: TextStyle(color: _kText, fontSize: 15))
                : _Breadcrumb(project: project),
            titleSpacing: 0,
            actions: project == null
                ? null
                : [
                    _ActionBtn(
                      label: '+ Column',
                      onTap: () =>
                          showColumnDialog(context, project: project),
                    ),
                    const SizedBox(width: 8),
                    _ActionBtn(
                      label: '+ Card',
                      isPrimary: true,
                      onTap: project.columns.isEmpty
                          ? null
                          : () => showCardDialog(
                                context,
                                columns: project.columns,
                              ),
                    ),
                    const SizedBox(width: 12),
                  ],
            bottom: PreferredSize(
              preferredSize: const Size.fromHeight(1),
              child: Container(color: _kBorder, height: 1),
            ),
          ),
          body: provider.isLoading
              ? const Center(child: CircularProgressIndicator())
              : project == null
                  ? _buildNotFound()
                  : project.columns.isEmpty
                      ? _buildEmptyColumns(context, project)
                      : _buildBoard(context, project),
        );
      },
    );
  }

  Widget _buildNotFound() {
    return const Center(
      child: Text(
        'Project not found.',
        style: TextStyle(color: _kMuted, fontSize: 15),
      ),
    );
  }

  Widget _buildEmptyColumns(BuildContext context, KanbanProject project) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 72,
            height: 72,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: _kBorder),
            ),
            child: const Icon(Icons.view_week_outlined,
                size: 36, color: _kMuted),
          ),
          const SizedBox(height: 20),
          const Text(
            'No columns yet',
            style: TextStyle(
                color: _kText, fontSize: 16, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 8),
          const Text(
            'Add a column to start organising cards.',
            style: TextStyle(color: _kMuted, fontSize: 13),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: () => showColumnDialog(context, project: project),
            icon: const Icon(Icons.add),
            label: const Text('Add Column'),
            style: ElevatedButton.styleFrom(
              backgroundColor: _kGreen,
              foregroundColor: Colors.white,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBoard(BuildContext context, KanbanProject project) {
    return ListView.builder(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.all(16),
      itemCount: project.columns.length,
      itemBuilder: (context, i) =>
          _KanbanColumn(project: project, column: project.columns[i]),
    );
  }
}

// ─── Column widget ────────────────────────────────────────────────────────────

class _KanbanColumn extends StatelessWidget {
  const _KanbanColumn({required this.project, required this.column});
  final KanbanProject project;
  final KanbanColumn column;

  Color get _headerBg {
    if (column.color.isEmpty) return _kGreenSoft;
    return _kColumnColors[column.color] ?? _parseColor(column.color);
  }

  Color get _headerFg =>
      column.color.isEmpty ? _kGreenText : Colors.white;

  bool _isOverdue(KanbanCard card) {
    if (card.dueDate == null) return false;
    final d = DateTime.tryParse(card.dueDate!);
    return d != null && d.isBefore(DateTime.now());
  }

  Color _parseColor(String hex) {
    try {
      final h = hex.replaceFirst('#', '');
      if (h.length == 6) return Color(int.parse('FF$h', radix: 16));
    } catch (_) {}
    return _kGreen;
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 280,
      margin: const EdgeInsets.only(right: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: _kBorder),
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
        children: [
          _buildHeader(context),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.fromLTRB(8, 8, 8, 0),
              itemCount: column.cards.length + 1,
              itemBuilder: (context, i) {
                if (i == column.cards.length) {
                  return _AddCardBtn(
                    onTap: () => showCardDialog(
                      context,
                      columns: project.columns,
                      defaultColumn: column,
                    ),
                  );
                }
                return _CardTile(
                  card: column.cards[i],
                  project: project,
                  column: column,
                  isOverdue: _isOverdue(column.cards[i]),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader(BuildContext context) {
    return Container(
      color: _headerBg,
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
      child: Row(
        children: [
          Expanded(
            child: Row(
              children: [
                Flexible(
                  child: Text(
                    column.title,
                    style: TextStyle(
                      color: _headerFg,
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                const SizedBox(width: 6),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                  decoration: BoxDecoration(
                    color: Colors.white.withAlpha(56),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    '${column.cards.length}',
                    style: TextStyle(color: _headerFg, fontSize: 11),
                  ),
                ),
              ],
            ),
          ),
          _ColIconBtn(
            icon: '✏',
            fg: _headerFg,
            onTap: () =>
                showColumnDialog(context, project: project, column: column),
          ),
          const SizedBox(width: 3),
          _ColIconBtn(
            icon: '✕',
            fg: _headerFg,
            onTap: () => confirmDeleteColumn(context, column),
          ),
        ],
      ),
    );
  }
}

// ─── Card tile ────────────────────────────────────────────────────────────────

class _CardTile extends StatelessWidget {
  const _CardTile({
    required this.card,
    required this.project,
    required this.column,
    required this.isOverdue,
  });
  final KanbanCard card;
  final KanbanProject project;
  final KanbanColumn column;
  final bool isOverdue;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 6),
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: _kBorder),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            card.title,
            style: const TextStyle(
              color: _kText,
              fontSize: 13,
              fontWeight: FontWeight.w600,
            ),
          ),
          if (card.description.isNotEmpty) ...[
            const SizedBox(height: 4),
            Text(
              card.description,
              style: const TextStyle(
                  color: _kMuted, fontSize: 12, height: 1.4),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
          if (card.dueDate != null) ...[
            const SizedBox(height: 6),
            Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
              decoration: BoxDecoration(
                color:
                    isOverdue ? const Color(0xFFFEF2F2) : _kBg,
                borderRadius: BorderRadius.circular(4),
              ),
              child: Text(
                '📅 ${card.dueDate}',
                style: TextStyle(
                  color: isOverdue
                      ? const Color(0xFFEF4444)
                      : _kMuted,
                  fontSize: 11,
                ),
              ),
            ),
          ],
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                child: GestureDetector(
                  onTap: () => showCardDialog(
                    context,
                    columns: project.columns,
                    card: card,
                    defaultColumn: column,
                  ),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 4),
                    decoration: BoxDecoration(
                      color: _kGreenSoft,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: const Center(
                      child: Text(
                        'Edit',
                        style: TextStyle(
                          color: _kGreenText,
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 6),
              GestureDetector(
                onTap: () => confirmDeleteCard(context, card),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFEF2F2),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: const Text(
                    '✕',
                    style: TextStyle(
                        color: Color(0xFFEF4444), fontSize: 11),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ─── Small reusable widgets ───────────────────────────────────────────────────

class _Breadcrumb extends StatelessWidget {
  const _Breadcrumb({required this.project});
  final KanbanProject project;

  Color _parseColor(String hex) {
    try {
      final h = hex.replaceFirst('#', '');
      if (h.length == 6) return Color(int.parse('FF$h', radix: 16));
    } catch (_) {}
    return _kGreen;
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 10,
          height: 10,
          decoration: BoxDecoration(
            color: _parseColor(project.color),
            shape: BoxShape.circle,
          ),
        ),
        const SizedBox(width: 8),
        Flexible(
          child: Text(
            project.name,
            style: const TextStyle(
              color: _kText,
              fontSize: 15,
              fontWeight: FontWeight.w600,
            ),
            overflow: TextOverflow.ellipsis,
          ),
        ),
      ],
    );
  }
}

class _ActionBtn extends StatelessWidget {
  const _ActionBtn({
    required this.label,
    this.onTap,
    this.isPrimary = false,
  });
  final String label;
  final VoidCallback? onTap;
  final bool isPrimary;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding:
            const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          color: isPrimary ? _kGreen : Colors.white,
          border: Border.all(
              color: isPrimary ? _kGreen : _kBorder),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: isPrimary ? Colors.white : _kText,
            fontSize: 13,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }
}

class _ColIconBtn extends StatelessWidget {
  const _ColIconBtn(
      {required this.icon, required this.fg, required this.onTap});
  final String icon;
  final Color fg;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 22,
        height: 22,
        decoration: BoxDecoration(
          color: Colors.white.withAlpha(56),
          borderRadius: BorderRadius.circular(4),
        ),
        child: Center(
          child: Text(icon, style: TextStyle(color: fg, fontSize: 11)),
        ),
      ),
    );
  }
}

class _AddCardBtn extends StatelessWidget {
  const _AddCardBtn({required this.onTap});
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(top: 4, bottom: 8),
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          border: Border.all(color: _kBorder),
          borderRadius: BorderRadius.circular(6),
        ),
        child: const Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              '+ Add card',
              style: TextStyle(color: _kMuted, fontSize: 12.8),
            ),
          ],
        ),
      ),
    );
  }
}
