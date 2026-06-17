import 'package:flutter/foundation.dart';

import '../core/api/api_client.dart';
import '../core/api/sync_service.dart';
import '../core/database/database_helper.dart';

class DashboardStats {
  const DashboardStats({
    this.notes = 0,
    this.tasksTotal = 0,
    this.tasksPending = 0,
    this.tasksDone = 0,
    this.contactsTotal = 0,
    this.contactsPending = 0,
    this.kanbanBoards = 0,
    this.kanbanCards = 0,
  });

  final int notes;
  final int tasksTotal;
  final int tasksPending;
  final int tasksDone;
  final int contactsTotal;
  final int contactsPending;
  final int kanbanBoards;
  final int kanbanCards;
}

class DashboardProvider extends ChangeNotifier {
  DashboardStats _stats = const DashboardStats();
  bool _isLoading = false;
  bool _isSyncing = false;
  String? _errorMessage;

  DashboardStats get stats => _stats;
  bool get isLoading => _isLoading;
  bool get isSyncing => _isSyncing;
  String? get errorMessage => _errorMessage;

  Future<void> loadStats() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final response =
          await ApiClient.instance.get<Map<String, dynamic>>('/api/dashboard');
      final data = response.data;
      if (data != null) {
        _stats = DashboardStats(
          notes: data['notes_count'] as int? ?? data['notes'] as int? ?? 0,
          tasksTotal: data['tasks_total'] as int? ?? 0,
          tasksPending: data['tasks_pending'] as int? ?? 0,
          tasksDone: data['tasks_done'] as int? ?? 0,
          contactsTotal: data['contacts_total'] as int? ?? 0,
          contactsPending: data['contacts_pending'] as int? ?? 0,
          kanbanBoards: data['kanban_boards'] as int? ?? 0,
          kanbanCards: data['kanban_cards'] as int? ?? 0,
        );
      }
    } on Exception {
      // Server unreachable — derive counts from local SQLite instead.
      try {
        final local = await DatabaseHelper.instance.getLocalStats();
        _stats = DashboardStats(
          notes: local['notes'] ?? 0,
          tasksTotal: local['tasks_total'] ?? 0,
          tasksPending: local['tasks_pending'] ?? 0,
          tasksDone: local['tasks_done'] ?? 0,
          contactsTotal: local['contacts_total'] ?? 0,
          contactsPending: local['contacts_pending'] ?? 0,
          kanbanBoards: local['kanban_boards'] ?? 0,
          kanbanCards: local['kanban_cards'] ?? 0,
        );
      } on Exception catch (e) {
        _errorMessage = 'Failed to load dashboard: ${e.toString()}';
      }
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> syncAll({
    required Future<void> Function() onNotesRefresh,
    required Future<void> Function() onTasksRefresh,
    required Future<void> Function() onContactsRefresh,
    required Future<void> Function() onKanbanRefresh,
  }) async {
    _isSyncing = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await SyncService.instance.syncAll();
    } catch (_) {
      // Server unreachable — continue with local data; loadStats will fall back.
    }

    await Future.wait([
      onNotesRefresh(),
      onTasksRefresh(),
      onContactsRefresh(),
      onKanbanRefresh(),
    ]);
    await loadStats();

    _isSyncing = false;
    notifyListeners();
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}
