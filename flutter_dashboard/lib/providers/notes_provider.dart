import 'package:flutter/foundation.dart';

import '../core/api/sync_service.dart';
import '../core/database/database_helper.dart';
import '../models/note_model.dart';

class NotesProvider extends ChangeNotifier {
  List<NoteModel> _notes = [];
  List<NoteModel> _filtered = [];
  bool _isLoading = false;
  String? _errorMessage;
  String _searchQuery = '';

  List<NoteModel> get notes => _filtered;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  int get count => _notes.length;

  /// Syncs from API then reads SQLite. Used when navigating to the screen.
  Future<void> loadNotes() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await SyncService.instance.syncNotes();
    } catch (_) {
      // Sync failed — will display whatever is already in local DB.
    }

    try {
      _notes = await DatabaseHelper.instance.getNotes();
      _applySearch();
    } on Exception catch (e) {
      _errorMessage = 'Failed to load notes: ${e.toString()}';
    }

    _isLoading = false;
    notifyListeners();
  }

  /// Reads SQLite only — no API call. Used after an explicit sync completes.
  Future<void> reloadFromLocal() async {
    try {
      _notes = await DatabaseHelper.instance.getNotes();
      _applySearch();
      notifyListeners();
    } on Exception {
      // ignore
    }
  }

  void search(String query) {
    _searchQuery = query.toLowerCase();
    _applySearch();
    notifyListeners();
  }

  void _applySearch() {
    if (_searchQuery.isEmpty) {
      _filtered = List.from(_notes);
    } else {
      _filtered = _notes.where((n) {
        return n.title.toLowerCase().contains(_searchQuery) ||
            n.content.toLowerCase().contains(_searchQuery);
      }).toList();
    }
  }

  Future<void> createNote({required String title, required String content}) async {
    _isLoading = true;
    notifyListeners();

    try {
      final now = DateTime.now().toIso8601String();
      final draft = NoteModel(
        id: 0,
        title: title,
        content: content,
        createdAt: now,
        updatedAt: now,
        syncStatus: 'pending',
      );
      final created = await SyncService.instance.createNote(draft);
      _notes.insert(0, created);
      _applySearch();
    } on Exception catch (e) {
      _errorMessage = 'Failed to create note: ${e.toString()}';
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> updateNote(NoteModel note, {required String title, required String content}) async {
    try {
      final now = DateTime.now().toIso8601String();
      final updated = note.copyWith(title: title, content: content, updatedAt: now);
      await SyncService.instance.updateNote(updated);
      final idx = _notes.indexWhere((n) => n.id == note.id);
      if (idx != -1) {
        _notes[idx] = updated;
        _applySearch();
        notifyListeners();
      }
    } on Exception catch (e) {
      _errorMessage = 'Failed to update note: ${e.toString()}';
      notifyListeners();
    }
  }

  Future<void> deleteNote(NoteModel note) async {
    try {
      await SyncService.instance.deleteNote(note);
      _notes.removeWhere((n) => n.id == note.id);
      _applySearch();
      notifyListeners();
    } on Exception catch (e) {
      _errorMessage = 'Failed to delete note: ${e.toString()}';
      notifyListeners();
    }
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}
