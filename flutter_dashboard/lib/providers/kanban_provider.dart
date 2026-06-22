import 'package:flutter/foundation.dart';

import '../core/api/sync_service.dart';
import '../core/database/database_helper.dart';
import '../models/kanban_models.dart';

class KanbanProvider extends ChangeNotifier {
  List<KanbanBoard> _boards = [];
  KanbanBoard? _selectedBoard;
  List<KanbanProject> _projects = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<KanbanBoard> get boards => _boards;
  KanbanBoard? get selectedBoard => _selectedBoard;
  List<KanbanProject> get projects => _projects;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  int get boardCount => _boards.length;

  /// Syncs from API then reads SQLite. Used when navigating to the screen.
  Future<void> loadBoards() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await SyncService.instance.pullKanban();
    } catch (_) {
      // Sync failed — display whatever is already in local DB.
    }

    try {
      _boards = await DatabaseHelper.instance.getBoards();
      if (_boards.isNotEmpty) {
        await selectBoard(_boards.first);
      } else {
        _selectedBoard = null;
        _projects = [];
      }
    } on Exception catch (e) {
      _errorMessage = 'Failed to load boards: ${e.toString()}';
    }

    _isLoading = false;
    notifyListeners();
  }

  /// Reads SQLite only — no API call. Used after an explicit sync completes.
  Future<void> reloadFromLocal() async {
    try {
      _boards = await DatabaseHelper.instance.getBoards();
      if (_boards.isNotEmpty) {
        await selectBoard(_boards.first);
      } else {
        _selectedBoard = null;
        _projects = [];
      }
      notifyListeners();
    } on Exception {
      // ignore
    }
  }

  Future<void> selectBoard(KanbanBoard board) async {
    _selectedBoard = board;
    _isLoading = true;
    notifyListeners();

    try {
      await _loadProjectsForBoard(board.id);
    } on Exception catch (e) {
      _errorMessage = 'Failed to load board projects: ${e.toString()}';
    }

    _isLoading = false;
    notifyListeners();
  }

  // ─── Projects ─────────────────────────────────────────────────────────────

  Future<void> createProject({
    required String name,
    required String description,
    required String color,
  }) async {
    if (_selectedBoard == null) return;
    try {
      final project = KanbanProject(
        id: 0,
        boardId: _selectedBoard!.id,
        remoteBoardId: _selectedBoard!.remoteId,
        name: name,
        description: description,
        color: color,
      );
      await SyncService.instance.createProject(project);
      await _silentReload();
    } on Exception catch (e) {
      _errorMessage = 'Failed to create project: $e';
      notifyListeners();
    }
  }

  Future<void> updateProject(
    KanbanProject project, {
    required String name,
    required String description,
    required String color,
  }) async {
    try {
      final updated = project.copyWith(name: name, description: description, color: color);
      await SyncService.instance.updateProject(updated);
      await _silentReload();
    } on Exception catch (e) {
      _errorMessage = 'Failed to update project: $e';
      notifyListeners();
    }
  }

  Future<void> deleteProject(KanbanProject project) async {
    try {
      await SyncService.instance.deleteProject(project);
      await _silentReload();
    } on Exception catch (e) {
      _errorMessage = 'Failed to delete project: $e';
      notifyListeners();
    }
  }

  // ─── Columns ──────────────────────────────────────────────────────────────

  Future<void> createColumn({
    required KanbanProject project,
    required String title,
    required String color,
  }) async {
    try {
      final column = KanbanColumn(
        id: 0,
        projectId: project.id,
        remoteProjectId: project.remoteId,
        title: title,
        color: color,
      );
      await SyncService.instance.createColumn(column);
      await _silentReload();
    } on Exception catch (e) {
      _errorMessage = 'Failed to create column: $e';
      notifyListeners();
    }
  }

  Future<void> updateColumn(
    KanbanColumn column, {
    required String title,
    required String color,
  }) async {
    try {
      final updated = column.copyWith(title: title, color: color);
      await SyncService.instance.updateColumn(updated);
      await _silentReload();
    } on Exception catch (e) {
      _errorMessage = 'Failed to update column: $e';
      notifyListeners();
    }
  }

  Future<void> deleteColumn(KanbanColumn column) async {
    try {
      await SyncService.instance.deleteColumn(column);
      await _silentReload();
    } on Exception catch (e) {
      _errorMessage = 'Failed to delete column: $e';
      notifyListeners();
    }
  }

  // ─── Cards ────────────────────────────────────────────────────────────────

  Future<void> createCard({
    required KanbanColumn column,
    required String title,
    required String description,
    String? dueDate,
  }) async {
    try {
      final card = KanbanCard(
        id: 0,
        columnId: column.id,
        remoteColumnId: column.remoteId,
        title: title,
        description: description,
        dueDate: dueDate,
      );
      await SyncService.instance.createCard(card);
      await _silentReload();
    } on Exception catch (e) {
      _errorMessage = 'Failed to create card: $e';
      notifyListeners();
    }
  }

  Future<void> updateCard(
    KanbanCard card, {
    required String title,
    required String description,
    String? dueDate,
  }) async {
    try {
      final updated = card.copyWith(title: title, description: description, dueDate: dueDate);
      await SyncService.instance.updateCard(updated);
      await _silentReload();
    } on Exception catch (e) {
      _errorMessage = 'Failed to update card: $e';
      notifyListeners();
    }
  }

  Future<void> deleteCard(KanbanCard card) async {
    try {
      await SyncService.instance.deleteCard(card);
      await _silentReload();
    } on Exception catch (e) {
      _errorMessage = 'Failed to delete card: $e';
      notifyListeners();
    }
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────

  KanbanProject? projectById(int id) {
    try {
      return _projects.firstWhere((p) => p.id == id);
    } on StateError {
      return null;
    }
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }

  /// Reload projects from SQLite without showing a loading indicator.
  Future<void> _silentReload() async {
    if (_selectedBoard == null) return;
    try {
      await _loadProjectsForBoard(_selectedBoard!.id);
      notifyListeners();
    } on Exception {
      // ignore
    }
  }

  Future<void> _loadProjectsForBoard(int boardId) async {
    final rawProjects = await DatabaseHelper.instance.getProjectsByBoard(boardId);
    final projects = <KanbanProject>[];
    for (final project in rawProjects) {
      final rawColumns = await DatabaseHelper.instance.getColumnsByProject(project.id);
      final columns = <KanbanColumn>[];
      for (final column in rawColumns) {
        final cards = await DatabaseHelper.instance.getCardsByColumn(column.id);
        columns.add(column.copyWith(cards: cards));
      }
      projects.add(project.copyWith(columns: columns));
    }
    _projects = projects;
  }
}
