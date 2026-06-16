import 'package:flutter/foundation.dart';

import '../core/api/sync_service.dart';
import '../core/database/database_helper.dart';
import '../models/task_model.dart';

class TasksProvider extends ChangeNotifier {
  List<TaskModel> _tasks = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<TaskModel> get pending => _tasks.where((t) => !t.isCompleted).toList();
  List<TaskModel> get done => _tasks.where((t) => t.isCompleted).toList();
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  int get totalCount => _tasks.length;
  int get pendingCount => pending.length;

  /// Syncs from API then reads SQLite. Used when navigating to the screen.
  Future<void> loadTasks() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await SyncService.instance.syncTasks();
    } catch (_) {
      // Sync failed — will display whatever is already in local DB.
    }

    try {
      _tasks = await DatabaseHelper.instance.getTasks();
    } on Exception catch (e) {
      _errorMessage = 'Failed to load tasks: ${e.toString()}';
    }

    _isLoading = false;
    notifyListeners();
  }

  /// Reads SQLite only — no API call. Used after an explicit sync completes.
  Future<void> reloadFromLocal() async {
    try {
      _tasks = await DatabaseHelper.instance.getTasks();
      notifyListeners();
    } on Exception {
      // ignore
    }
  }

  Future<void> createTask({
    required String title,
    required String description,
    String? dueDate,
  }) async {
    _isLoading = true;
    notifyListeners();

    try {
      final now = DateTime.now().toIso8601String();
      final draft = TaskModel(
        id: 0,
        title: title,
        description: description,
        isCompleted: false,
        dueDate: dueDate,
        createdAt: now,
        updatedAt: now,
        syncStatus: 'pending',
      );
      final created = await SyncService.instance.createTask(draft);
      _tasks.insert(0, created);
    } on Exception catch (e) {
      _errorMessage = 'Failed to create task: ${e.toString()}';
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> updateTask(
    TaskModel task, {
    required String title,
    required String description,
    String? dueDate,
  }) async {
    try {
      final now = DateTime.now().toIso8601String();
      final updated = task.copyWith(
        title: title,
        description: description,
        dueDate: dueDate,
        updatedAt: now,
      );
      await SyncService.instance.updateTask(updated);
      final idx = _tasks.indexWhere((t) => t.id == task.id);
      if (idx != -1) {
        _tasks[idx] = updated;
        notifyListeners();
      }
    } on Exception catch (e) {
      _errorMessage = 'Failed to update task: ${e.toString()}';
      notifyListeners();
    }
  }

  Future<void> toggleTask(TaskModel task) async {
    try {
      final updated = await SyncService.instance.toggleTask(task);
      final idx = _tasks.indexWhere((t) => t.id == task.id);
      if (idx != -1) {
        _tasks[idx] = updated;
        notifyListeners();
      }
    } on Exception catch (e) {
      _errorMessage = 'Failed to toggle task: ${e.toString()}';
      notifyListeners();
    }
  }

  Future<void> deleteTask(TaskModel task) async {
    try {
      await SyncService.instance.deleteTask(task);
      _tasks.removeWhere((t) => t.id == task.id);
      notifyListeners();
    } on Exception catch (e) {
      _errorMessage = 'Failed to delete task: ${e.toString()}';
      notifyListeners();
    }
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}
