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
    final response = await _api.get<dynamic>('/api/tasks');
    final data = response.data;
    if (data == null) return;

    final List<dynamic> list = data is List ? data : (data['data'] as List? ?? []);
    await _db.clearTasks();
    for (final item in list) {
      final task = TaskModel.fromApi(item as Map<String, dynamic>);
      await _db.insertTask(task);
    }
  }

  Future<TaskModel> createTask(TaskModel task) async {
    final response = await _api.post<Map<String, dynamic>>(
      '/api/tasks',
      data: task.toApiPayload(),
    );
    final data = response.data!;
    final created = TaskModel.fromApi(data['data'] as Map<String, dynamic>? ?? data);
    final id = await _db.insertTask(created);
    return created.copyWith(id: id);
  }

  Future<void> updateTask(TaskModel task) async {
    if (task.remoteId == null) return;
    await _api.put<dynamic>(
      '/api/tasks/${task.remoteId}',
      data: task.toApiPayload(),
    );
    await _db.updateTask(task);
  }

  Future<TaskModel> toggleTask(TaskModel task) async {
    if (task.remoteId == null) {
      final toggled = task.copyWith(isCompleted: !task.isCompleted);
      await _db.updateTask(toggled);
      return toggled;
    }
    final response = await _api.patch<Map<String, dynamic>>(
      '/api/tasks/${task.remoteId}/toggle',
    );
    final data = response.data!;
    final updated = TaskModel.fromApi(data['data'] as Map<String, dynamic>? ?? data);
    final localUpdated = updated.copyWith(id: task.id);
    await _db.updateTask(localUpdated);
    return localUpdated;
  }

  Future<void> deleteTask(TaskModel task) async {
    if (task.remoteId != null) {
      await _api.delete<dynamic>('/api/tasks/${task.remoteId}');
    }
    await _db.deleteTask(task.id);
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

  Future<void> replyContact(ContactModel contact, String reply) async {
    if (contact.remoteId == null) return;
    await _api.post<dynamic>(
      '/api/contacts/${contact.remoteId}/reply',
      data: {'reply': reply},
    );
    final now = DateTime.now().toIso8601String();
    final updated = contact.copyWith(reply: reply, repliedAt: now);
    await _db.updateContact(updated);
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
