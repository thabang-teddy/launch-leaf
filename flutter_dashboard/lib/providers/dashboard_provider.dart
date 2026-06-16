import 'package:flutter/foundation.dart';

import '../core/api/api_client.dart';
import '../core/api/sync_service.dart';

class DashboardStats {
  const DashboardStats({
    this.notes = 0,
    this.tasksTotal = 0,
    this.tasksPending = 0,
    this.contactsTotal = 0,
    this.contactsPending = 0,
    this.kanbanBoards = 0,
  });

  final int notes;
  final int tasksTotal;
  final int tasksPending;
  final int contactsTotal;
  final int contactsPending;
  final int kanbanBoards;
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
      final response = await ApiClient.instance.get<Map<String, dynamic>>('/api/dashboard');
      final data = response.data;
      if (data != null) {
        _stats = DashboardStats(
          notes: data['notes'] as int? ?? 0,
          tasksTotal: data['tasks_total'] as int? ?? 0,
          tasksPending: data['tasks_pending'] as int? ?? 0,
          contactsTotal: data['contacts_total'] as int? ?? 0,
          contactsPending: data['contacts_pending'] as int? ?? 0,
          kanbanBoards: data['kanban_boards'] as int? ?? 0,
        );
      }
    } on Exception catch (e) {
      _errorMessage = 'Failed to load dashboard: ${e.toString()}';
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> syncAll({
    required VoidCallback onNotesRefresh,
    required VoidCallback onTasksRefresh,
    required VoidCallback onContactsRefresh,
    required VoidCallback onKanbanRefresh,
  }) async {
    _isSyncing = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await SyncService.instance.syncAll();
      onNotesRefresh();
      onTasksRefresh();
      onContactsRefresh();
      onKanbanRefresh();
      await loadStats();
    } on Exception catch (e) {
      _errorMessage = 'Sync failed: ${e.toString()}';
    }

    _isSyncing = false;
    notifyListeners();
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}
