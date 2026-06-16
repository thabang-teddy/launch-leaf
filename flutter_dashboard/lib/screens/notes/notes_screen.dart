import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import '../../core/constants/app_colors.dart';
import '../../models/note_model.dart';
import '../../providers/notes_provider.dart';
import '../../shared/widgets/ll_search_bar.dart';

class NotesScreen extends StatefulWidget {
  const NotesScreen({super.key});

  @override
  State<NotesScreen> createState() => _NotesScreenState();
}

class _NotesScreenState extends State<NotesScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<NotesProvider>().loadNotes();
    });
  }

  Future<void> _confirmDelete(NoteModel note) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Note'),
        content: Text('Delete "${note.title}"? This cannot be undone.'),
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
      await context.read<NotesProvider>().deleteNote(note);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Notes')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: LlSearchBar(
              hintText: 'Search notes...',
              onChanged: (q) => context.read<NotesProvider>().search(q),
            ),
          ),
          Expanded(
            child: Consumer<NotesProvider>(
              builder: (context, provider, _) {
                if (provider.isLoading) {
                  return const Center(child: CircularProgressIndicator());
                }
                if (provider.notes.isEmpty) {
                  return _buildEmptyState();
                }
                return RefreshIndicator(
                  onRefresh: provider.loadNotes,
                  child: ListView.separated(
                    padding: const EdgeInsets.fromLTRB(16, 0, 16, 80),
                    itemCount: provider.notes.length,
                    separatorBuilder: (context, index) => const SizedBox(height: 8),
                    itemBuilder: (_, i) => _buildNoteCard(provider.notes[i]),
                  ),
                );
              },
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.push('/notes/new'),
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.note_outlined, size: 64, color: AppColors.border),
          const SizedBox(height: 16),
          const Text(
            'No notes yet',
            style: TextStyle(color: AppColors.muted, fontSize: 16),
          ),
          const SizedBox(height: 8),
          ElevatedButton.icon(
            onPressed: () => context.push('/notes/new'),
            icon: const Icon(Icons.add),
            label: const Text('Create Note'),
          ),
        ],
      ),
    );
  }

  Widget _buildNoteCard(NoteModel note) {
    final preview = note.content.length > 100
        ? '${note.content.substring(0, 100)}...'
        : note.content;

    return Dismissible(
      key: Key('note_${note.id}'),
      direction: DismissDirection.endToStart,
      onDismissed: (_) => _confirmDelete(note),
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        decoration: BoxDecoration(
          color: AppColors.accent,
          borderRadius: BorderRadius.circular(8),
        ),
        child: const Icon(Icons.delete_outline, color: Colors.white),
      ),
      child: InkWell(
        onTap: () => context.push('/notes/${note.id}'),
        borderRadius: BorderRadius.circular(8),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.card,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(
                      note.title.isEmpty ? '(Untitled)' : note.title,
                      style: const TextStyle(
                        color: AppColors.dark,
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  _buildDateChip(note.updatedAt),
                ],
              ),
              if (preview.isNotEmpty) ...[
                const SizedBox(height: 6),
                Text(
                  preview,
                  style: const TextStyle(
                    color: AppColors.muted,
                    fontSize: 13,
                    height: 1.4,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDateChip(String dateStr) {
    String label = '';
    try {
      final dt = DateTime.parse(dateStr);
      final now = DateTime.now();
      final diff = now.difference(dt);
      if (diff.inDays == 0) {
        label = 'Today';
      } else if (diff.inDays == 1) {
        label = 'Yesterday';
      } else if (diff.inDays < 7) {
        label = '${diff.inDays}d ago';
      } else {
        label = '${dt.day}/${dt.month}/${dt.year}';
      }
    } on Exception {
      label = '';
    }
    if (label.isEmpty) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: AppColors.background,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.border),
      ),
      child: Text(
        label,
        style: const TextStyle(color: AppColors.muted, fontSize: 11),
      ),
    );
  }
}
