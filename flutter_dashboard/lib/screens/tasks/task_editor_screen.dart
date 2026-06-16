import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../../core/constants/app_colors.dart';
import '../../models/task_model.dart';
import '../../providers/tasks_provider.dart';

class TaskEditorScreen extends StatefulWidget {
  const TaskEditorScreen({super.key, this.taskId});

  final int? taskId;

  @override
  State<TaskEditorScreen> createState() => _TaskEditorScreenState();
}

class _TaskEditorScreenState extends State<TaskEditorScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descController = TextEditingController();
  DateTime? _dueDate;
  TaskModel? _existingTask;
  bool _isSaving = false;

  bool get _isNew => widget.taskId == null;

  @override
  void initState() {
    super.initState();
    if (!_isNew) {
      WidgetsBinding.instance.addPostFrameCallback((_) => _loadTask());
    }
  }

  void _loadTask() {
    final provider = context.read<TasksProvider>();
    final all = [...provider.pending, ...provider.done];
    final task = all.where((t) => t.id == widget.taskId).firstOrNull;
    if (task != null) {
      _existingTask = task;
      _titleController.text = task.title;
      _descController.text = task.description;
      if (task.dueDate != null) {
        try {
          _dueDate = DateTime.parse(task.dueDate!);
        } on Exception {
          _dueDate = null;
        }
      }
      setState(() {});
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _descController.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _dueDate ?? DateTime.now(),
      firstDate: DateTime.now().subtract(const Duration(days: 365)),
      lastDate: DateTime.now().add(const Duration(days: 365 * 5)),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(primary: AppColors.accent),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      setState(() => _dueDate = picked);
    }
  }

  Future<void> _handleSave() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isSaving = true);

    final provider = context.read<TasksProvider>();
    final dueDateStr = _dueDate?.toIso8601String();

    try {
      if (_isNew) {
        await provider.createTask(
          title: _titleController.text.trim(),
          description: _descController.text.trim(),
          dueDate: dueDateStr,
        );
      } else if (_existingTask != null) {
        await provider.updateTask(
          _existingTask!,
          title: _titleController.text.trim(),
          description: _descController.text.trim(),
          dueDate: dueDateStr,
        );
      }
      if (mounted) context.pop();
    } on Exception {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to save task')),
        );
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(_isNew ? 'New Task' : 'Edit Task'),
        actions: [
          if (_isSaving)
            const Padding(
              padding: EdgeInsets.all(16),
              child: SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: Colors.white,
                ),
              ),
            )
          else
            TextButton(
              onPressed: _handleSave,
              child: const Text('Save', style: TextStyle(color: Colors.white)),
            ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Title',
                style: TextStyle(
                  color: AppColors.text,
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 6),
              TextFormField(
                controller: _titleController,
                textCapitalization: TextCapitalization.sentences,
                decoration: const InputDecoration(hintText: 'Task title'),
                validator: (v) =>
                    v == null || v.trim().isEmpty ? 'Enter a title' : null,
              ),
              const SizedBox(height: 16),
              const Text(
                'Description',
                style: TextStyle(
                  color: AppColors.text,
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 6),
              TextFormField(
                controller: _descController,
                maxLines: 4,
                textCapitalization: TextCapitalization.sentences,
                decoration: const InputDecoration(
                  hintText: 'Optional description...',
                  alignLabelWithHint: true,
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Due Date',
                style: TextStyle(
                  color: AppColors.text,
                  fontSize: 13,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 6),
              GestureDetector(
                onTap: _pickDate,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 14,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.card,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Row(
                    children: [
                      const Icon(
                        Icons.calendar_today_outlined,
                        color: AppColors.muted,
                        size: 18,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          _dueDate != null
                              ? DateFormat('MMM d, yyyy').format(_dueDate!)
                              : 'No due date',
                          style: TextStyle(
                            color: _dueDate != null
                                ? AppColors.text
                                : AppColors.muted,
                            fontSize: 14,
                          ),
                        ),
                      ),
                      if (_dueDate != null)
                        GestureDetector(
                          onTap: () => setState(() => _dueDate = null),
                          child: const Icon(
                            Icons.close,
                            color: AppColors.muted,
                            size: 18,
                          ),
                        ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
