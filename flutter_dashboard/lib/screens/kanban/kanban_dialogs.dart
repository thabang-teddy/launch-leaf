import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../models/kanban_models.dart';
import '../../providers/kanban_provider.dart';

// Laravel palette & design tokens
const _kPalette = [
  '#2DC9A2', '#6366F1', '#F59E0B', '#EF4444',
  '#06B6D4', '#8B5CF6', '#F97316', '#10B981',
];

const _kGreen  = Color(0xFF2DC9A2);
const _kBg     = Color(0xFFF0F4F3);
const _kBorder = Color(0xFFE3EDEA);
const _kText   = Color(0xFF1B2E2B);
const _kMuted  = Color(0xFF748D8A);
const _kDanger = Color(0xFFEF4444);

// ─── Column color labels (matches Board.jsx COLOR_OPTIONS) ────────────────────

const _kColumnColorOptions = [
  ('', 'Mint (default)'),
  ('primary', 'Blue'),
  ('secondary', 'Gray'),
  ('success', 'Green'),
  ('danger', 'Red'),
  ('warning', 'Yellow'),
  ('info', 'Cyan'),
  ('dark', 'Dark'),
];

// ─── Project dialogs ──────────────────────────────────────────────────────────

Future<void> showProjectDialog(
  BuildContext context, {
  KanbanProject? project,
}) async {
  await showDialog<void>(
    context: context,
    barrierDismissible: true,
    builder: (ctx) => _ProjectDialog(project: project),
  );
}

Future<void> confirmDeleteProject(
  BuildContext context,
  KanbanProject project,
) async {
  final confirmed = await showDialog<bool>(
    context: context,
    builder: (ctx) => AlertDialog(
      title: const Text('Delete project?'),
      content: Text(
        '"${project.name}" and ALL its columns and cards will be permanently deleted.',
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(ctx).pop(false),
          child: const Text('Cancel'),
        ),
        TextButton(
          style: TextButton.styleFrom(foregroundColor: _kDanger),
          onPressed: () => Navigator.of(ctx).pop(true),
          child: const Text('Delete Project'),
        ),
      ],
    ),
  );
  if (confirmed == true && context.mounted) {
    await context.read<KanbanProvider>().deleteProject(project);
  }
}

// ─── Column dialogs ───────────────────────────────────────────────────────────

Future<void> showColumnDialog(
  BuildContext context, {
  required KanbanProject project,
  KanbanColumn? column,
}) async {
  await showDialog<void>(
    context: context,
    barrierDismissible: true,
    builder: (ctx) => _ColumnDialog(project: project, column: column),
  );
}

Future<void> confirmDeleteColumn(
  BuildContext context,
  KanbanColumn column,
) async {
  final confirmed = await showDialog<bool>(
    context: context,
    builder: (ctx) => AlertDialog(
      title: const Text('Delete column?'),
      content: const Text('All its cards will also be permanently deleted.'),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(ctx).pop(false),
          child: const Text('Cancel'),
        ),
        TextButton(
          style: TextButton.styleFrom(foregroundColor: _kDanger),
          onPressed: () => Navigator.of(ctx).pop(true),
          child: const Text('Delete Column'),
        ),
      ],
    ),
  );
  if (confirmed == true && context.mounted) {
    await context.read<KanbanProvider>().deleteColumn(column);
  }
}

// ─── Card dialogs ─────────────────────────────────────────────────────────────

Future<void> showCardDialog(
  BuildContext context, {
  required List<KanbanColumn> columns,
  KanbanCard? card,
  KanbanColumn? defaultColumn,
}) async {
  await showDialog<void>(
    context: context,
    barrierDismissible: true,
    builder: (ctx) => _CardDialog(
      columns: columns,
      card: card,
      defaultColumn: defaultColumn,
    ),
  );
}

Future<void> confirmDeleteCard(
  BuildContext context,
  KanbanCard card,
) async {
  final confirmed = await showDialog<bool>(
    context: context,
    builder: (ctx) => AlertDialog(
      title: const Text('Delete card?'),
      content: const Text('This card will be permanently deleted.'),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(ctx).pop(false),
          child: const Text('Cancel'),
        ),
        TextButton(
          style: TextButton.styleFrom(foregroundColor: _kDanger),
          onPressed: () => Navigator.of(ctx).pop(true),
          child: const Text('Delete Card'),
        ),
      ],
    ),
  );
  if (confirmed == true && context.mounted) {
    await context.read<KanbanProvider>().deleteCard(card);
  }
}

// ─── Project form dialog ──────────────────────────────────────────────────────

class _ProjectDialog extends StatefulWidget {
  const _ProjectDialog({this.project});
  final KanbanProject? project;

  @override
  State<_ProjectDialog> createState() => _ProjectDialogState();
}

class _ProjectDialogState extends State<_ProjectDialog> {
  late final TextEditingController _nameCtrl;
  late final TextEditingController _descCtrl;
  late String _color;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _nameCtrl = TextEditingController(text: widget.project?.name ?? '');
    _descCtrl = TextEditingController(text: widget.project?.description ?? '');
    _color = widget.project?.color ?? '#2DC9A2';
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _descCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_nameCtrl.text.trim().isEmpty) return;
    setState(() => _saving = true);
    final provider = context.read<KanbanProvider>();
    if (widget.project == null) {
      await provider.createProject(
        name: _nameCtrl.text.trim(),
        description: _descCtrl.text.trim(),
        color: _color,
      );
    } else {
      await provider.updateProject(
        widget.project!,
        name: _nameCtrl.text.trim(),
        description: _descCtrl.text.trim(),
        color: _color,
      );
    }
    if (mounted) Navigator.of(context).pop();
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
    final isEdit = widget.project != null;
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      insetPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 480),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _dialogHeader(
                isEdit ? 'Edit Project' : 'New Project',
                onClose: () => Navigator.of(context).pop(),
              ),
              const SizedBox(height: 20),
              _fieldLabel('Project Name *'),
              const SizedBox(height: 4),
              TextField(
                controller: _nameCtrl,
                autofocus: true,
                decoration: _inputDecoration('Project name'),
              ),
              const SizedBox(height: 16),
              _fieldLabel('Description'),
              const SizedBox(height: 4),
              TextField(
                controller: _descCtrl,
                maxLines: 3,
                decoration: _inputDecoration('Optional description'),
              ),
              const SizedBox(height: 16),
              _fieldLabel('Accent Color'),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: _kPalette.map((hex) {
                  final selected = _color == hex;
                  return GestureDetector(
                    onTap: () => setState(() => _color = hex),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 100),
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        color: _parseColor(hex),
                        shape: BoxShape.circle,
                        border: Border.all(
                          color: selected ? _kText : Colors.transparent,
                          width: 3,
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 8),
              Container(
                height: 5,
                decoration: BoxDecoration(
                  color: _parseColor(_color),
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
              const SizedBox(height: 24),
              _dialogFooter(
                saving: _saving,
                submitLabel: isEdit ? 'Update Project' : 'Create Project',
                onCancel: () => Navigator.of(context).pop(),
                onSubmit: _saving ? null : _submit,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── Column form dialog ───────────────────────────────────────────────────────

class _ColumnDialog extends StatefulWidget {
  const _ColumnDialog({required this.project, this.column});
  final KanbanProject project;
  final KanbanColumn? column;

  @override
  State<_ColumnDialog> createState() => _ColumnDialogState();
}

class _ColumnDialogState extends State<_ColumnDialog> {
  late final TextEditingController _titleCtrl;
  late String _color;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _titleCtrl = TextEditingController(text: widget.column?.title ?? '');
    _color = widget.column?.color ?? '';
  }

  @override
  void dispose() {
    _titleCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_titleCtrl.text.trim().isEmpty) return;
    setState(() => _saving = true);
    final provider = context.read<KanbanProvider>();
    if (widget.column == null) {
      await provider.createColumn(
        project: widget.project,
        title: _titleCtrl.text.trim(),
        color: _color,
      );
    } else {
      await provider.updateColumn(
        widget.column!,
        title: _titleCtrl.text.trim(),
        color: _color,
      );
    }
    if (mounted) Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final isEdit = widget.column != null;
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      insetPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 480),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _dialogHeader(
                isEdit ? 'Edit Column' : 'Add Column',
                onClose: () => Navigator.of(context).pop(),
              ),
              const SizedBox(height: 20),
              _fieldLabel('Title *'),
              const SizedBox(height: 4),
              TextField(
                controller: _titleCtrl,
                autofocus: true,
                decoration: _inputDecoration('Column title'),
              ),
              const SizedBox(height: 16),
              _fieldLabel('Header Color'),
              const SizedBox(height: 4),
              _styledDropdown<String>(
                value: _color,
                items: _kColumnColorOptions
                    .map((opt) => DropdownMenuItem(
                          value: opt.$1,
                          child: Text(opt.$2),
                        ))
                    .toList(),
                onChanged: (v) => setState(() => _color = v ?? ''),
              ),
              const SizedBox(height: 24),
              _dialogFooter(
                saving: _saving,
                submitLabel: isEdit ? 'Update Column' : 'Add Column',
                onCancel: () => Navigator.of(context).pop(),
                onSubmit: _saving ? null : _submit,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── Card form dialog ─────────────────────────────────────────────────────────

class _CardDialog extends StatefulWidget {
  const _CardDialog({required this.columns, this.card, this.defaultColumn});
  final List<KanbanColumn> columns;
  final KanbanCard? card;
  final KanbanColumn? defaultColumn;

  @override
  State<_CardDialog> createState() => _CardDialogState();
}

class _CardDialogState extends State<_CardDialog> {
  late final TextEditingController _titleCtrl;
  late final TextEditingController _descCtrl;
  late final TextEditingController _dueDateCtrl;
  late int? _selectedColumnId;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _titleCtrl = TextEditingController(text: widget.card?.title ?? '');
    _descCtrl = TextEditingController(text: widget.card?.description ?? '');
    _dueDateCtrl = TextEditingController(text: widget.card?.dueDate ?? '');
    _selectedColumnId = widget.defaultColumn?.id ??
        (widget.columns.isNotEmpty ? widget.columns.first.id : null);
  }

  @override
  void dispose() {
    _titleCtrl.dispose();
    _descCtrl.dispose();
    _dueDateCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_titleCtrl.text.trim().isEmpty) return;
    setState(() => _saving = true);
    final provider = context.read<KanbanProvider>();
    final dueDate = _dueDateCtrl.text.trim().isEmpty ? null : _dueDateCtrl.text.trim();

    if (widget.card == null) {
      final column = widget.columns.firstWhere((c) => c.id == _selectedColumnId);
      await provider.createCard(
        column: column,
        title: _titleCtrl.text.trim(),
        description: _descCtrl.text.trim(),
        dueDate: dueDate,
      );
    } else {
      await provider.updateCard(
        widget.card!,
        title: _titleCtrl.text.trim(),
        description: _descCtrl.text.trim(),
        dueDate: dueDate,
      );
    }
    if (mounted) Navigator.of(context).pop();
  }

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: now,
      firstDate: DateTime(now.year - 1),
      lastDate: DateTime(now.year + 5),
    );
    if (picked != null) {
      final mm = picked.month.toString().padLeft(2, '0');
      final dd = picked.day.toString().padLeft(2, '0');
      _dueDateCtrl.text = '${picked.year}-$mm-$dd';
    }
  }

  @override
  Widget build(BuildContext context) {
    final isEdit = widget.card != null;
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      insetPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 480),
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _dialogHeader(
                isEdit ? 'Edit Card' : 'Add Card',
                onClose: () => Navigator.of(context).pop(),
              ),
              const SizedBox(height: 20),
              // Column selector only for create mode
              if (!isEdit) ...[
                _fieldLabel('Column'),
                const SizedBox(height: 4),
                _styledDropdown<int>(
                  value: _selectedColumnId,
                  items: widget.columns
                      .map((col) => DropdownMenuItem(
                            value: col.id,
                            child: Text(col.title),
                          ))
                      .toList(),
                  onChanged: (v) => setState(() => _selectedColumnId = v),
                ),
                const SizedBox(height: 16),
              ],
              _fieldLabel('Title *'),
              const SizedBox(height: 4),
              TextField(
                controller: _titleCtrl,
                autofocus: true,
                decoration: _inputDecoration('Card title'),
              ),
              const SizedBox(height: 16),
              _fieldLabel('Description'),
              const SizedBox(height: 4),
              TextField(
                controller: _descCtrl,
                maxLines: 3,
                decoration: _inputDecoration('Optional description'),
              ),
              const SizedBox(height: 16),
              _fieldLabel('Due Date'),
              const SizedBox(height: 4),
              TextField(
                controller: _dueDateCtrl,
                readOnly: true,
                onTap: _pickDate,
                decoration: _inputDecoration('YYYY-MM-DD').copyWith(
                  suffixIcon: const Icon(Icons.calendar_today_outlined, size: 18),
                ),
              ),
              const SizedBox(height: 24),
              _dialogFooter(
                saving: _saving,
                submitLabel: isEdit ? 'Update Card' : 'Add Card',
                onCancel: () => Navigator.of(context).pop(),
                onSubmit: _saving ? null : _submit,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── Shared dialog helpers ────────────────────────────────────────────────────

Widget _dialogHeader(String title, {required VoidCallback onClose}) {
  return Row(
    children: [
      Expanded(
        child: Text(
          title,
          style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w700,
            color: _kText,
          ),
        ),
      ),
      InkWell(
        onTap: onClose,
        borderRadius: BorderRadius.circular(6),
        child: Container(
          width: 28,
          height: 28,
          decoration: BoxDecoration(
            color: _kBg,
            borderRadius: BorderRadius.circular(6),
          ),
          child: const Icon(Icons.close, size: 16, color: _kMuted),
        ),
      ),
    ],
  );
}

Widget _dialogFooter({
  required bool saving,
  required String submitLabel,
  required VoidCallback onCancel,
  required VoidCallback? onSubmit,
}) {
  return Row(
    mainAxisAlignment: MainAxisAlignment.end,
    children: [
      OutlinedButton(
        onPressed: onCancel,
        style: OutlinedButton.styleFrom(
          foregroundColor: _kText,
          side: const BorderSide(color: _kBorder),
        ),
        child: const Text('Cancel'),
      ),
      const SizedBox(width: 8),
      ElevatedButton(
        onPressed: onSubmit,
        style: ElevatedButton.styleFrom(
          backgroundColor: _kGreen,
          foregroundColor: Colors.white,
        ),
        child: Text(saving ? 'Saving…' : submitLabel),
      ),
    ],
  );
}

Widget _styledDropdown<T>({
  required T? value,
  required List<DropdownMenuItem<T>> items,
  required ValueChanged<T?> onChanged,
}) =>
    Container(
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: _kBorder),
        borderRadius: BorderRadius.circular(8),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 12),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<T>(
          value: value,
          isExpanded: true,
          items: items,
          onChanged: onChanged,
          style: const TextStyle(color: _kText, fontSize: 14),
          dropdownColor: Colors.white,
          borderRadius: BorderRadius.circular(8),
        ),
      ),
    );

Widget _fieldLabel(String text) => Text(
      text,
      style: const TextStyle(
        fontWeight: FontWeight.w600,
        fontSize: 12.8,
        color: _kText,
      ),
    );

InputDecoration _inputDecoration(String? hint) => InputDecoration(
      hintText: hint,
      hintStyle: const TextStyle(color: _kMuted),
      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: _kBorder),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: _kBorder),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(color: _kGreen, width: 2),
      ),
      filled: true,
      fillColor: Colors.white,
    );
