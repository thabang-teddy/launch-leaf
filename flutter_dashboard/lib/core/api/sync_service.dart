import 'dart:convert';

import '../database/database_helper.dart';
import 'api_client.dart';
import '../../models/contact_model.dart';
import '../../models/kanban_models.dart';
import '../../models/note_model.dart';
import '../../models/sync_change_model.dart';
import '../../models/task_model.dart';

class SyncService {
  SyncService._();
  static final SyncService instance = SyncService._();

  final _db = DatabaseHelper.instance;
  final _api = ApiClient.instance;

  // ─── Sync (push pending changes to server) ────────────────────────────────

  /// Reads all pending change records, sends them to the server, and applies
  /// the results. On network failure all records are left untouched for retry.
  Future<void> syncAll() async {
    final pending = await _db.getPendingChanges();
    if (pending.isEmpty) return;

    try {
      final response = await _api.post<Map<String, dynamic>>(
        '/api/sync/changes',
        data: {'changes': pending.map((c) => c.toApiPayload()).toList()},
      );

      final resultsJson =
          response.data?['results'] as List<dynamic>? ?? [];

      for (final resultJson in resultsJson) {
        final result = SyncChangeResult.fromJson(
          resultJson as Map<String, dynamic>,
        );

        if (result.syncedSuccess) {
          if (result.actionType == 'create' && result.remoteId != null) {
            await _db.updateRemoteId(
              result.tableName,
              result.localId,
              result.remoteId!,
            );
          }
          await _db.deleteChange(result.localId, result.tableName);
        } else if (result.data != null) {
          // Server won the conflict — apply server data locally.
          await _applyServerData(result);
          await _db.deleteChange(result.localId, result.tableName);
        }
        // syncedSuccess == false && data == null → leave for retry
      }
    } on Exception {
      // Network or server error — all change records stay for next sync.
    }
  }

  Future<void> _applyServerData(SyncChangeResult result) async {
    final data = result.data!;
    switch (result.tableName) {
      case 'notes':
        final note =
            NoteModel.fromApi(data).copyWith(id: result.localId, syncStatus: 'synced');
        await _db.updateNote(note);
      case 'tasks':
        final task =
            TaskModel.fromApi(data).copyWith(id: result.localId, syncStatus: 'synced');
        await _db.updateTask(task);
      case 'kanban_boards':
        final board =
            KanbanBoard.fromApi(data).copyWith(id: result.localId, syncStatus: 'synced');
        await _db.updateBoard(board);
      case 'kanban_projects':
        final existing = await _db.getProjectById(result.localId);
        if (existing == null) return;
        final project = KanbanProject.fromApi(data, existing.boardId)
            .copyWith(id: result.localId, syncStatus: 'synced');
        await _db.updateProject(project);
      case 'kanban_columns':
        final existing = await _db.getColumnById(result.localId);
        if (existing == null) return;
        final column = KanbanColumn.fromApi(data, existing.projectId)
            .copyWith(id: result.localId, syncStatus: 'synced');
        await _db.updateColumn(column);
      case 'kanban_cards':
        final existing = await _db.getCardById(result.localId);
        if (existing == null) return;
        final card = KanbanCard.fromApi(data, existing.columnId)
            .copyWith(id: result.localId, syncStatus: 'synced');
        await _db.updateCard(card);
    }
  }

  // ─── Pull helpers (full server replace — use for initial load / reset) ────

  Future<void> pullNotes() async {
    final response = await _api.get<dynamic>('/api/notes');
    final data = response.data;
    if (data == null) return;
    final list = data is List ? data : (data['data'] as List? ?? []);
    await _db.clearNotes();
    for (final item in list) {
      await _db.insertNote(NoteModel.fromApi(item as Map<String, dynamic>));
    }
  }

  Future<void> pullTasks() async {
    final response = await _api.get<dynamic>('/api/tasks');
    final data = response.data;
    if (data == null) return;
    final list = data is List ? data : (data['data'] as List? ?? []);
    await _db.clearTasks();
    for (final item in list) {
      await _db.insertTask(TaskModel.fromApi(item as Map<String, dynamic>));
    }
  }

  Future<void> pullContacts() async {
    final response = await _api.get<dynamic>('/api/contacts');
    final data = response.data;
    if (data == null) return;
    final list = data is List ? data : (data['data'] as List? ?? []);
    await _db.clearContacts();
    for (final item in list) {
      await _db.insertContact(
          ContactModel.fromApi(item as Map<String, dynamic>));
    }
  }

  Future<void> pullKanban() async {
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

      for (final projectJson
          in (boardMap['projects'] as List<dynamic>? ?? [])) {
        final projectMap = projectJson as Map<String, dynamic>;
        final project = KanbanProject.fromApi(projectMap, boardId);
        final projectId = await _db.insertProject(project);

        for (final columnJson
            in (projectMap['columns'] as List<dynamic>? ?? [])) {
          final columnMap = columnJson as Map<String, dynamic>;
          final column = KanbanColumn.fromApi(columnMap, projectId);
          final columnId = await _db.insertColumn(column);

          for (final cardJson
              in (columnMap['cards'] as List<dynamic>? ?? [])) {
            final card = KanbanCard.fromApi(
                cardJson as Map<String, dynamic>, columnId);
            await _db.insertCard(card);
          }
        }
      }
    }
  }

  Future<void> pullAll() async {
    await Future.wait([
      pullNotes(),
      pullTasks(),
      pullContacts(),
      pullKanban(),
    ]);
  }

  // ─── Notes ────────────────────────────────────────────────────────────────

  Future<NoteModel> createNote(NoteModel note) async {
    final now = DateTime.now().toIso8601String();
    final toInsert = note.copyWith(
      syncStatus: 'synced',
      createdAt: note.createdAt.isEmpty ? now : note.createdAt,
      updatedAt: now,
    );
    final localId = await _db.insertNote(toInsert);
    final saved = toInsert.copyWith(id: localId);
    await _db.upsertChange(SyncChange(
      localId: localId,
      remoteId: saved.remoteId?.toString(),
      tableName: 'notes',
      actionType: 'create',
      datetime: saved.updatedAt,
      data: jsonEncode(saved.toMap()),
    ));
    return saved;
  }

  Future<void> updateNote(NoteModel note) async {
    final now = DateTime.now().toIso8601String();
    final updated = note.copyWith(updatedAt: now, syncStatus: 'synced');
    await _db.updateNote(updated);
    await _db.upsertChange(SyncChange(
      localId: updated.id,
      remoteId: updated.remoteId?.toString(),
      tableName: 'notes',
      actionType: 'update',
      datetime: updated.updatedAt,
      data: jsonEncode(updated.toMap()),
    ));
  }

  Future<void> deleteNote(NoteModel note) async {
    await _db.deleteNote(note.id);
    await _db.upsertChange(SyncChange(
      localId: note.id,
      remoteId: note.remoteId?.toString(),
      tableName: 'notes',
      actionType: 'delete',
      datetime: DateTime.now().toIso8601String(),
      data: jsonEncode(note.toMap()),
    ));
  }

  // ─── Tasks ────────────────────────────────────────────────────────────────

  Future<TaskModel> createTask(TaskModel task) async {
    final now = DateTime.now().toIso8601String();
    final toInsert = task.copyWith(
      syncStatus: 'synced',
      createdAt: task.createdAt.isEmpty ? now : task.createdAt,
      updatedAt: now,
    );
    final localId = await _db.insertTask(toInsert);
    final saved = toInsert.copyWith(id: localId);
    await _db.upsertChange(SyncChange(
      localId: localId,
      remoteId: saved.remoteId?.toString(),
      tableName: 'tasks',
      actionType: 'create',
      datetime: saved.updatedAt,
      data: jsonEncode(saved.toMap()),
    ));
    return saved;
  }

  Future<void> updateTask(TaskModel task) async {
    final now = DateTime.now().toIso8601String();
    final updated = task.copyWith(updatedAt: now, syncStatus: 'synced');
    await _db.updateTask(updated);
    await _db.upsertChange(SyncChange(
      localId: updated.id,
      remoteId: updated.remoteId?.toString(),
      tableName: 'tasks',
      actionType: 'update',
      datetime: updated.updatedAt,
      data: jsonEncode(updated.toMap()),
    ));
  }

  Future<TaskModel> toggleTask(TaskModel task) async {
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
      syncStatus: 'synced',
    );
    await _db.updateTask(toggled);
    await _db.upsertChange(SyncChange(
      localId: toggled.id,
      remoteId: toggled.remoteId?.toString(),
      tableName: 'tasks',
      actionType: 'update',
      datetime: now,
      data: jsonEncode(toggled.toMap()),
    ));
    return toggled;
  }

  Future<void> deleteTask(TaskModel task) async {
    await _db.deleteTask(task.id);
    await _db.upsertChange(SyncChange(
      localId: task.id,
      remoteId: task.remoteId?.toString(),
      tableName: 'tasks',
      actionType: 'delete',
      datetime: DateTime.now().toIso8601String(),
      data: jsonEncode(task.toMap()),
    ));
  }

  // ─── Contacts ─────────────────────────────────────────────────────────────

  Future<void> deleteContact(ContactModel contact) async {
    await _db.deleteContact(contact.id);
    await _db.upsertChange(SyncChange(
      localId: contact.id,
      remoteId: contact.remoteId?.toString(),
      tableName: 'contacts',
      actionType: 'delete',
      datetime: DateTime.now().toIso8601String(),
      data: jsonEncode(contact.toMap()),
    ));
  }

  // ─── Kanban Boards ────────────────────────────────────────────────────────

  Future<void> createBoard(KanbanBoard board) async {
    final localId = await _db.insertBoard(board.copyWith(syncStatus: 'synced'));
    await _db.upsertChange(SyncChange(
      localId: localId,
      remoteId: board.remoteId,
      tableName: 'kanban_boards',
      actionType: 'create',
      datetime: DateTime.now().toIso8601String(),
      data: jsonEncode(board.copyWith(id: localId, syncStatus: 'synced').toMap()),
    ));
  }

  Future<void> updateBoard(KanbanBoard board) async {
    final updated = board.copyWith(syncStatus: 'synced');
    await _db.updateBoard(updated);
    await _db.upsertChange(SyncChange(
      localId: updated.id,
      remoteId: updated.remoteId,
      tableName: 'kanban_boards',
      actionType: 'update',
      datetime: DateTime.now().toIso8601String(),
      data: jsonEncode(updated.toMap()),
    ));
  }

  Future<void> deleteBoard(KanbanBoard board) async {
    final columns = await _db.getColumnsByProject(board.id);
    for (final col in columns) {
      final cards = await _db.getCardsByColumn(col.id);
      for (final card in cards) {
        await _db.deleteCard(card.id);
      }
      await _db.deleteColumn(col.id);
    }
    await _db.deleteProject(board.id);
    await _db.upsertChange(SyncChange(
      localId: board.id,
      remoteId: board.remoteId,
      tableName: 'kanban_boards',
      actionType: 'delete',
      datetime: DateTime.now().toIso8601String(),
      data: jsonEncode(board.toMap()),
    ));
  }

  // ─── Kanban Projects ──────────────────────────────────────────────────────

  Future<void> createProject(KanbanProject project) async {
    final localId =
        await _db.insertProject(project.copyWith(syncStatus: 'synced'));
    await _db.upsertChange(SyncChange(
      localId: localId,
      remoteId: project.remoteId,
      tableName: 'kanban_projects',
      actionType: 'create',
      datetime: DateTime.now().toIso8601String(),
      data: jsonEncode(
          project.copyWith(id: localId, syncStatus: 'synced').toMap()),
    ));
  }

  Future<void> updateProject(KanbanProject project) async {
    final updated = project.copyWith(syncStatus: 'synced');
    await _db.updateProject(updated);
    await _db.upsertChange(SyncChange(
      localId: updated.id,
      remoteId: updated.remoteId,
      tableName: 'kanban_projects',
      actionType: 'update',
      datetime: DateTime.now().toIso8601String(),
      data: jsonEncode(updated.toMap()),
    ));
  }

  Future<void> deleteProject(KanbanProject project) async {
    final columns = await _db.getColumnsByProject(project.id);
    for (final col in columns) {
      final cards = await _db.getCardsByColumn(col.id);
      for (final card in cards) {
        await _db.deleteCard(card.id);
      }
      await _db.deleteColumn(col.id);
    }
    await _db.deleteProject(project.id);
    await _db.upsertChange(SyncChange(
      localId: project.id,
      remoteId: project.remoteId,
      tableName: 'kanban_projects',
      actionType: 'delete',
      datetime: DateTime.now().toIso8601String(),
      data: jsonEncode(project.toMap()),
    ));
  }

  // ─── Kanban Columns ───────────────────────────────────────────────────────

  Future<void> createColumn(KanbanColumn column) async {
    final localId =
        await _db.insertColumn(column.copyWith(syncStatus: 'synced'));
    await _db.upsertChange(SyncChange(
      localId: localId,
      remoteId: column.remoteId,
      tableName: 'kanban_columns',
      actionType: 'create',
      datetime: DateTime.now().toIso8601String(),
      data: jsonEncode(
          column.copyWith(id: localId, syncStatus: 'synced').toMap()),
    ));
  }

  Future<void> updateColumn(KanbanColumn column) async {
    final updated = column.copyWith(syncStatus: 'synced');
    await _db.updateColumn(updated);
    await _db.upsertChange(SyncChange(
      localId: updated.id,
      remoteId: updated.remoteId,
      tableName: 'kanban_columns',
      actionType: 'update',
      datetime: DateTime.now().toIso8601String(),
      data: jsonEncode(updated.toMap()),
    ));
  }

  Future<void> deleteColumn(KanbanColumn column) async {
    final cards = await _db.getCardsByColumn(column.id);
    for (final card in cards) {
      await _db.deleteCard(card.id);
    }
    await _db.deleteColumn(column.id);
    await _db.upsertChange(SyncChange(
      localId: column.id,
      remoteId: column.remoteId,
      tableName: 'kanban_columns',
      actionType: 'delete',
      datetime: DateTime.now().toIso8601String(),
      data: jsonEncode(column.toMap()),
    ));
  }

  // ─── Kanban Cards ─────────────────────────────────────────────────────────

  Future<void> createCard(KanbanCard card) async {
    final localId = await _db.insertCard(card.copyWith(syncStatus: 'synced'));
    await _db.upsertChange(SyncChange(
      localId: localId,
      remoteId: card.remoteId,
      tableName: 'kanban_cards',
      actionType: 'create',
      datetime: DateTime.now().toIso8601String(),
      data:
          jsonEncode(card.copyWith(id: localId, syncStatus: 'synced').toMap()),
    ));
  }

  Future<void> updateCard(KanbanCard card) async {
    final updated = card.copyWith(syncStatus: 'synced');
    await _db.updateCard(updated);
    await _db.upsertChange(SyncChange(
      localId: updated.id,
      remoteId: updated.remoteId,
      tableName: 'kanban_cards',
      actionType: 'update',
      datetime: DateTime.now().toIso8601String(),
      data: jsonEncode(updated.toMap()),
    ));
  }

  Future<void> deleteCard(KanbanCard card) async {
    await _db.deleteCard(card.id);
    await _db.upsertChange(SyncChange(
      localId: card.id,
      remoteId: card.remoteId,
      tableName: 'kanban_cards',
      actionType: 'delete',
      datetime: DateTime.now().toIso8601String(),
      data: jsonEncode(card.toMap()),
    ));
  }
}
