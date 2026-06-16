import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../core/constants/app_colors.dart';
import '../../models/note_model.dart';
import '../../providers/notes_provider.dart';

class NoteEditorScreen extends StatefulWidget {
  const NoteEditorScreen({super.key, this.noteId});

  final int? noteId;

  @override
  State<NoteEditorScreen> createState() => _NoteEditorScreenState();
}

class _NoteEditorScreenState extends State<NoteEditorScreen> {
  final _titleController = TextEditingController();
  final _contentController = TextEditingController();
  NoteModel? _existingNote;
  bool _isSaving = false;

  bool get _isNew => widget.noteId == null;

  @override
  void initState() {
    super.initState();
    if (!_isNew) {
      WidgetsBinding.instance.addPostFrameCallback((_) => _loadNote());
    }
  }

  void _loadNote() {
    final provider = context.read<NotesProvider>();
    final note = provider.notes.where((n) => n.id == widget.noteId).firstOrNull;
    if (note != null) {
      _existingNote = note;
      _titleController.text = note.title;
      _contentController.text = note.content;
      setState(() {});
    }
  }

  @override
  void dispose() {
    _titleController.dispose();
    _contentController.dispose();
    super.dispose();
  }

  Future<void> _handleSave() async {
    if (_titleController.text.trim().isEmpty &&
        _contentController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Note cannot be empty')),
      );
      return;
    }

    setState(() => _isSaving = true);

    final provider = context.read<NotesProvider>();
    try {
      if (_isNew) {
        await provider.createNote(
          title: _titleController.text.trim(),
          content: _contentController.text.trim(),
        );
      } else if (_existingNote != null) {
        await provider.updateNote(
          _existingNote!,
          title: _titleController.text.trim(),
          content: _contentController.text.trim(),
        );
      }
      if (mounted) context.pop();
    } on Exception {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to save note')),
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
        title: Text(_isNew ? 'New Note' : 'Edit Note'),
        actions: [
          if (_isSaving)
            const Padding(
              padding: EdgeInsets.all(16),
              child: SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
              ),
            )
          else
            TextButton(
              onPressed: _handleSave,
              child: const Text('Save', style: TextStyle(color: Colors.white)),
            ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(
              controller: _titleController,
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w600,
                color: AppColors.dark,
              ),
              decoration: const InputDecoration(
                hintText: 'Title',
                hintStyle: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w600,
                  color: AppColors.muted,
                ),
                border: InputBorder.none,
                enabledBorder: InputBorder.none,
                focusedBorder: InputBorder.none,
                contentPadding: EdgeInsets.symmetric(vertical: 8),
              ),
              textCapitalization: TextCapitalization.sentences,
            ),
            const Divider(color: AppColors.border),
            const SizedBox(height: 8),
            Expanded(
              child: TextField(
                controller: _contentController,
                style: const TextStyle(
                  fontSize: 15,
                  color: AppColors.text,
                  height: 1.6,
                ),
                decoration: const InputDecoration(
                  hintText: 'Write something...',
                  hintStyle: TextStyle(color: AppColors.muted, fontSize: 15),
                  border: InputBorder.none,
                  enabledBorder: InputBorder.none,
                  focusedBorder: InputBorder.none,
                  contentPadding: EdgeInsets.zero,
                ),
                maxLines: null,
                expands: true,
                textAlignVertical: TextAlignVertical.top,
                textCapitalization: TextCapitalization.sentences,
                keyboardType: TextInputType.multiline,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
