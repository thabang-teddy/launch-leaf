import '../database/database_helper.dart';
import 'api_client.dart';
import '../../models/contact_model.dart';
import '../../models/kanban_models.dart';
import '../../models/note_model.dart';
import '../../models/task_model.dart';

class SyncService {
  SyncService._();
  static final SyncService instance = SyncService._();

  final _db = DatabaseHelper.instance;
  final _api = ApiClient.instance;

  Future<void> syncAll() async {
    await Future.wait([
      syncNotes(),
      syncTasks(),
      syncContacts(),
      syncKanban(),
    ]);
  }

  // ─── Notes ──────────────────────────────────────────────────────────────

  Future<void> syncNotes() async {
    final response = await _api.get<dynamic>('/api/notes');
    final data = response.data;
    if (data == null) return;

    final List<dynamic> list = data is List ? data : (data['data'] as List? ?? []);
    await _db.clearNotes();
    for (final item in list) {
      final note = NoteModel.fromApi(item as Map<String, dynamic>);
      await _db.insertNote(note);
    }
  }

  Future<NoteModel> createNote(NoteModel note) async {
    final response = await _api.post<Map<String, dynamic>>(
      '/api/notes',
      data: note.toApiPayload(),
    );
    final data = response.data!;
    final created = NoteModel.fromApi(data['data'] as Map<String, dynamic>? ?? data);
    final id = await _db.insertNote(created);
    return created.copyWith(id: id);
  }

  Future<void> updateNote(NoteModel note) async {
    if (note.remoteId == null) return;
    await _api.put<dynamic>(
      '/api/notes/${note.remoteId}',
      data: note.toApiPayload(),
    );
    await _db.updateNote(note);
  }

  Future<void> deleteNote(NoteModel note) async {
    if (note.remoteId != null) {
      await _api.delete<dynamic>('/api/notes/${note.remoteId}');
    }
    await _db.deleteNote(note.id);
  }

  // ─── Tasks ──────────────────────────────────────────────────────────────

  Future<void> syncTasks() async {
    // Preserve locally-created tasks that have never been pushed.
    final localOnly = await _db.getLocalOnlyTasks();

    final response = await _api.get<dynamic>('/api/tasks');
    final data = response.data;
    if (data == null) return;

    final List<dynamic> list = data is List ? data : (data['data'] as List? ?? []);
    await _db.clearTasks();
    for (final item in list) {
      final task = TaskModel.fromApi(item as Map<String, dynamic>);
      await _db.insertTask(task);
    }

    // Re-insert any tasks that only exist locally (pending, no remoteId).
    for (final task in localOnly) {
      await _db.insertTask(task);
    }

    // Push any pending local changes to the server now that we're online.
    await pushPendingTasks();
  }

  Future<void> pushPendingTasks() async {
    final pending = await _db.getPendingTasks();
    for (final task in pending) {
      try {
        if (task.remoteId == null) {
          // New task created offline — create on server.
          final response = await _api.post<Map<String, dynamic>>(
            '/api/tasks',
            data: task.toApiPayload(),
          );
          final responseData = response.data!;
          final created = TaskModel.fromApi(
            responseData['data'] as Map<String, dynamic>? ?? responseData,
          );
          await _db.updateTask(created.copyWith(id: task.id, syncStatus: 'synced'));
        } else {
          // Task updated offline — push changes to server.
          await _api.put<dynamic>(
            '/api/tasks/${task.remoteId}',
            data: task.toApiPayload(),
          );
          await _db.updateTask(task.copyWith(syncStatus: 'synced'));
        }
      } on Exception {
        // Keep as pending — will retry on the next sync.
      }
    }
  }

  Future<TaskModel> createTask(TaskModel task) async {
    // 1. Save locally immediately so the UI responds without a network round-trip.
    final localId = await _db.insertTask(task.copyWith(syncStatus: 'pending'));
    final localTask = task.copyWith(id: localId, syncStatus: 'pending');

    // 2. Try to push to the server in the same call (fast when online).
    try {
      final response = await _api.post<Map<String, dynamic>>(
        '/api/tasks',
        data: task.toApiPayload(),
      );
      final data = response.data!;
      final created = TaskModel.fromApi(data['data'] as Map<String, dynamic>? ?? data);
      final synced = created.copyWith(id: localId, syncStatus: 'synced');
      await _db.updateTask(synced);
      return synced;
    } on Exception {
      // Offline or server error — return the local copy; will sync later.
      return localTask;
    }
  }

  Future<void> updateTask(TaskModel task) async {
    // 1. Update locally immediately.
    await _db.updateTask(task.copyWith(syncStatus: 'pending'));

    if (task.remoteId == null) return;

    // 2. Try to push to the server.
    try {
      await _api.put<dynamic>(
        '/api/tasks/${task.remoteId}',
        data: task.toApiPayload(),
      );
      await _db.updateTask(task.copyWith(syncStatus: 'synced'));
    } on Exception {
      // Keep as pending — will sync later.
    }
  }

  Future<TaskModel> toggleTask(TaskModel task) async {
    // 1. Toggle locally immediately.
    final now = DateTime.now().toIso8601String();
    final toggled = TaskModel(
      id: task.id,
      remoteId: task.remoteId,
      title: task.title,
      description: task.description,
      isCompleted: !task.isCompleted,
      completedAt: !task.isCompleted ? now : null,
      dueDate: task.dueDate,
      orderIdx: task.orderIdx,
      createdAt: task.createdAt,
      updatedAt: now,
      syncStatus: 'pending',
    );
    await _db.updateTask(toggled);

    if (task.remoteId == null) return toggled;

    // 2. Try to push to the server.
    try {
      final response = await _api.patch<Map<String, dynamic>>(
        '/api/tasks/${task.remoteId}/toggle',
      );
      final data = response.data!;
      final updated = TaskModel.fromApi(data['data'] as Map<String, dynamic>? ?? data);
      final synced = updated.copyWith(id: task.id, syncStatus: 'synced');
      await _db.updateTask(synced);
      return synced;
    } on Exception {
      return toggled;
    }
  }

  Future<void> deleteTask(TaskModel task) async {
    // Delete locally immediately — best-effort delete on server.
    await _db.deleteTask(task.id);
    if (task.remoteId != null) {
      try {
        await _api.delete<dynamic>('/api/tasks/${task.remoteId}');
      } on Exception {
        // Server delete failed; local record is already gone.
      }
    }
  }

  // ─── Contacts ───────────────────────────────────────────────────────────

  Future<void> syncContacts() async {
    final response = await _api.get<dynamic>('/api/contacts');
    final data = response.data;
    if (data == null) return;

    final List<dynamic> list = data is List ? data : (data['data'] as List? ?? []);
    await _db.clearContacts();
    for (final item in list) {
      final contact = ContactModel.fromApi(item as Map<String, dynamic>);
      await _db.insertContact(contact);
    }
  }

  Future<void> deleteContact(ContactModel contact) async {
    if (contact.remoteId != null) {
      await _api.delete<dynamic>('/api/contacts/${contact.remoteId}');
    }
    await _db.deleteContact(contact.id);
  }

  // ─── Kanban ─────────────────────────────────────────────────────────────

  Future<void> syncKanban() async {
    final response = await _api.get<dynamic>('/api/kanban/full');
    final data = response.data;
    if (data == null) return;

    final List<dynamic> boardsJson =
        data is List ? data : (data['data'] as List? ?? []);

    await _db.clearKanban();

    for (final boardJson in boardsJson) {
      final boardMap = boardJson as Map<String, dynamic>;
      final board = KanbanBoard.fromApi(boardMap);
      final boardId = await _db.insertBoard(board);

      final projectsJson = boardMap['projects'] as List<dynamic>? ?? [];
      for (final projectJson in projectsJson) {
        final projectMap = projectJson as Map<String, dynamic>;
        final project = KanbanProject.fromApi(projectMap, boardId);
        final projectId = await _db.insertProject(project);

        final columnsJson = projectMap['columns'] as List<dynamic>? ?? [];
        for (final columnJson in columnsJson) {
          final columnMap = columnJson as Map<String, dynamic>;
          final column = KanbanColumn.fromApi(columnMap, projectId);
          final columnId = await _db.insertColumn(column);

          final cardsJson = columnMap['cards'] as List<dynamic>? ?? [];
          for (final cardJson in cardsJson) {
            final card = KanbanCard.fromApi(
              cardJson as Map<String, dynamic>,
              columnId,
            );
            await _db.insertCard(card);
          }
        }
      }
    }
  }
}
