import 'package:sqflite/sqflite.dart';

import '../../models/contact_model.dart';
import '../../models/kanban_models.dart';
import '../../models/note_model.dart';
import '../../models/sync_change_model.dart';
import '../../models/task_model.dart';

class DatabaseHelper {
  DatabaseHelper._();
  static final DatabaseHelper instance = DatabaseHelper._();

  Database? _database;

  Future<Database> get database async {
    _database ??= await _initDatabase();
    return _database!;
  }

  Future<Database> _initDatabase() async {
    final path = await getDatabasesPath();
    final dbPath = '$path/launch_leaf.db';
    return openDatabase(
      dbPath,
      version: 3,
      onCreate: _onCreate,
      onUpgrade: _onUpgrade,
    );
  }

  Future<void> _onUpgrade(Database db, int oldVersion, int newVersion) async {
    if (oldVersion < 2) {
      await db.execute('DROP TABLE IF EXISTS kanban_cards');
      await db.execute('DROP TABLE IF EXISTS kanban_columns');
      await db.execute('DROP TABLE IF EXISTS kanban_projects');
      await db.execute('DROP TABLE IF EXISTS kanban_boards');
      await _createKanbanTables(db);
    }
    if (oldVersion < 3) {
      await _createSyncChangesTable(db);
    }
  }

  Future<void> _onCreate(Database db, int version) async {
    await db.execute('''
      CREATE TABLE notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        remote_id INTEGER,
        title TEXT,
        content TEXT,
        created_at TEXT,
        updated_at TEXT,
        sync_status TEXT DEFAULT 'synced'
      )
    ''');

    await db.execute('''
      CREATE TABLE tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        remote_id INTEGER,
        title TEXT,
        description TEXT,
        is_completed INTEGER DEFAULT 0,
        completed_at TEXT,
        due_date TEXT,
        order_idx INTEGER DEFAULT 0,
        created_at TEXT,
        updated_at TEXT,
        sync_status TEXT DEFAULT 'synced'
      )
    ''');

    await db.execute('''
      CREATE TABLE contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        remote_id INTEGER,
        name TEXT,
        email TEXT,
        subject TEXT,
        message TEXT,
        reply TEXT,
        replied_at TEXT,
        created_at TEXT,
        updated_at TEXT,
        sync_status TEXT DEFAULT 'synced'
      )
    ''');

    await _createKanbanTables(db);
    await _createSyncChangesTable(db);
  }

  Future<void> _createKanbanTables(Database db) async {
    await db.execute('''
      CREATE TABLE kanban_boards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        remote_id TEXT,
        name TEXT,
        description TEXT,
        color TEXT,
        order_idx INTEGER DEFAULT 0,
        sync_status TEXT DEFAULT 'synced'
      )
    ''');

    await db.execute('''
      CREATE TABLE kanban_projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        remote_id TEXT,
        board_id INTEGER,
        remote_board_id TEXT,
        name TEXT,
        description TEXT,
        color TEXT,
        order_idx INTEGER DEFAULT 0,
        sync_status TEXT DEFAULT 'synced'
      )
    ''');

    await db.execute('''
      CREATE TABLE kanban_columns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        remote_id TEXT,
        project_id INTEGER,
        remote_project_id TEXT,
        title TEXT,
        color TEXT,
        order_idx INTEGER DEFAULT 0,
        sync_status TEXT DEFAULT 'synced'
      )
    ''');

    await db.execute('''
      CREATE TABLE kanban_cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        remote_id TEXT,
        column_id INTEGER,
        remote_column_id TEXT,
        title TEXT,
        description TEXT,
        due_date TEXT,
        order_idx INTEGER DEFAULT 0,
        sync_status TEXT DEFAULT 'synced'
      )
    ''');
  }

  Future<void> _createSyncChangesTable(Database db) async {
    await db.execute('''
      CREATE TABLE sync_changes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        local_id INTEGER NOT NULL,
        remote_id TEXT,
        table_name TEXT NOT NULL,
        action_type TEXT NOT NULL,
        datetime TEXT NOT NULL,
        data TEXT NOT NULL,
        UNIQUE(table_name, local_id)
      )
    ''');
  }

  // ─── Stats ────────────────────────────────────────────────────────────────

  Future<Map<String, int>> getLocalStats() async {
    final db = await database;

    int count(List<Map<String, Object?>> rows) =>
        (rows.first.values.first as int?) ?? 0;

    final notes = count(await db.rawQuery('SELECT COUNT(*) FROM notes'));
    final tasksTotal = count(await db.rawQuery('SELECT COUNT(*) FROM tasks'));
    final tasksPending = count(
        await db.rawQuery('SELECT COUNT(*) FROM tasks WHERE is_completed = 0'));
    final tasksDone = count(
        await db.rawQuery('SELECT COUNT(*) FROM tasks WHERE is_completed = 1'));
    final contactsTotal =
        count(await db.rawQuery('SELECT COUNT(*) FROM contacts'));
    const contactsPending = 0;
    final kanbanBoards =
        count(await db.rawQuery('SELECT COUNT(*) FROM kanban_boards'));
    final kanbanCards =
        count(await db.rawQuery('SELECT COUNT(*) FROM kanban_cards'));

    return {
      'notes': notes,
      'tasks_total': tasksTotal,
      'tasks_pending': tasksPending,
      'tasks_done': tasksDone,
      'contacts_total': contactsTotal,
      'contacts_pending': contactsPending,
      'kanban_boards': kanbanBoards,
      'kanban_cards': kanbanCards,
    };
  }

  // ─── Sync Changes ─────────────────────────────────────────────────────────

  /// Inserts or updates a change record with merge logic:
  ///   existing create  + new update → keep create, update data/datetime
  ///   existing create  + new delete → update to delete
  ///   existing update  + new update → update data/datetime
  ///   existing update  + new delete → update to delete
  ///   existing delete  + new create → update to create
  ///   no existing row              → insert
  Future<void> upsertChange(SyncChange change) async {
    final db = await database;

    final existing = await db.query(
      'sync_changes',
      where: 'table_name = ? AND local_id = ?',
      whereArgs: [change.tableName, change.localId],
      limit: 1,
    );

    if (existing.isEmpty) {
      final map = change.toMap()..remove('id');
      await db.insert('sync_changes', map);
      return;
    }

    final existingAction = existing.first['action_type'] as String;
    final existingId = existing.first['id'] as int;
    final newAction = change.actionType;

    final String mergedAction;
    if (existingAction == 'create' && newAction == 'update') {
      mergedAction = 'create';
    } else if (existingAction == 'create' && newAction == 'delete') {
      mergedAction = 'delete';
    } else if (existingAction == 'update' && newAction == 'update') {
      mergedAction = 'update';
    } else if (existingAction == 'update' && newAction == 'delete') {
      mergedAction = 'delete';
    } else if (existingAction == 'delete' && newAction == 'create') {
      mergedAction = 'create';
    } else {
      mergedAction = newAction;
    }

    await db.update(
      'sync_changes',
      {
        'action_type': mergedAction,
        'datetime': change.datetime,
        'data': change.data,
        'remote_id': change.remoteId,
      },
      where: 'id = ?',
      whereArgs: [existingId],
    );
  }

  Future<List<SyncChange>> getPendingChanges() async {
    final db = await database;
    final rows = await db.query('sync_changes', orderBy: 'id ASC');
    return rows.map(SyncChange.fromMap).toList();
  }

  Future<void> deleteChange(int localId, String tableName) async {
    final db = await database;
    await db.delete(
      'sync_changes',
      where: 'local_id = ? AND table_name = ?',
      whereArgs: [localId, tableName],
    );
  }

  Future<void> clearAllChanges() async {
    final db = await database;
    await db.delete('sync_changes');
  }

  /// Sets remote_id on a local item after a successful create sync.
  Future<void> updateRemoteId(
    String tableName,
    int localId,
    String remoteId,
  ) async {
    final db = await database;
    await db.rawUpdate(
      'UPDATE $tableName SET remote_id = ? WHERE id = ?',
      [remoteId, localId],
    );
  }

  // ─── Notes ────────────────────────────────────────────────────────────────

  Future<List<NoteModel>> getNotes() async {
    final db = await database;
    final rows = await db.query('notes', orderBy: 'updated_at DESC');
    return rows.map(NoteModel.fromMap).toList();
  }

  Future<int> insertNote(NoteModel note) async {
    final db = await database;
    final map = note.toMap()..remove('id');
    return db.insert('notes', map);
  }

  Future<void> updateNote(NoteModel note) async {
    final db = await database;
    await db.update(
      'notes',
      note.toMap(),
      where: 'id = ?',
      whereArgs: [note.id],
    );
  }

  Future<void> deleteNote(int id) async {
    final db = await database;
    await db.delete('notes', where: 'id = ?', whereArgs: [id]);
  }

  Future<void> upsertNoteByRemoteId(NoteModel note) async {
    final db = await database;
    final existing = await db.query(
      'notes',
      where: 'remote_id = ?',
      whereArgs: [note.remoteId],
      limit: 1,
    );
    if (existing.isEmpty) {
      final map = note.toMap()..remove('id');
      await db.insert('notes', map);
    } else {
      final localId = existing.first['id'] as int;
      await db.update(
        'notes',
        note.toMap()..['id'] = localId,
        where: 'id = ?',
        whereArgs: [localId],
      );
    }
  }

  Future<void> clearNotes() async {
    final db = await database;
    await db.delete('notes');
  }

  // ─── Tasks ────────────────────────────────────────────────────────────────

  Future<List<TaskModel>> getTasks() async {
    final db = await database;
    final rows =
        await db.query('tasks', orderBy: 'order_idx ASC, created_at DESC');
    return rows.map(TaskModel.fromMap).toList();
  }

  Future<List<TaskModel>> getPendingTasks() async {
    final db = await database;
    final rows = await db.query(
      'tasks',
      where: 'sync_status = ?',
      whereArgs: ['pending'],
    );
    return rows.map(TaskModel.fromMap).toList();
  }

  Future<List<TaskModel>> getLocalOnlyTasks() async {
    final db = await database;
    final rows = await db.query('tasks', where: 'remote_id IS NULL');
    return rows.map(TaskModel.fromMap).toList();
  }

  Future<int> insertTask(TaskModel task) async {
    final db = await database;
    final map = task.toMap()..remove('id');
    return db.insert('tasks', map);
  }

  Future<void> updateTask(TaskModel task) async {
    final db = await database;
    await db.update(
      'tasks',
      task.toMap(),
      where: 'id = ?',
      whereArgs: [task.id],
    );
  }

  Future<void> deleteTask(int id) async {
    final db = await database;
    await db.delete('tasks', where: 'id = ?', whereArgs: [id]);
  }

  Future<void> upsertTaskByRemoteId(TaskModel task) async {
    final db = await database;
    final existing = await db.query(
      'tasks',
      where: 'remote_id = ?',
      whereArgs: [task.remoteId],
      limit: 1,
    );
    if (existing.isEmpty) {
      final map = task.toMap()..remove('id');
      await db.insert('tasks', map);
    } else {
      final localId = existing.first['id'] as int;
      await db.update(
        'tasks',
        task.toMap()..['id'] = localId,
        where: 'id = ?',
        whereArgs: [localId],
      );
    }
  }

  Future<void> clearTasks() async {
    final db = await database;
    await db.delete('tasks');
  }

  // ─── Contacts ─────────────────────────────────────────────────────────────

  Future<List<ContactModel>> getContacts() async {
    final db = await database;
    final rows = await db.query('contacts', orderBy: 'created_at DESC');
    return rows.map(ContactModel.fromMap).toList();
  }

  Future<int> insertContact(ContactModel contact) async {
    final db = await database;
    final map = contact.toMap()..remove('id');
    return db.insert('contacts', map);
  }

  Future<void> updateContact(ContactModel contact) async {
    final db = await database;
    await db.update(
      'contacts',
      contact.toMap(),
      where: 'id = ?',
      whereArgs: [contact.id],
    );
  }

  Future<void> deleteContact(int id) async {
    final db = await database;
    await db.delete('contacts', where: 'id = ?', whereArgs: [id]);
  }

  Future<void> upsertContactByRemoteId(ContactModel contact) async {
    final db = await database;
    final existing = await db.query(
      'contacts',
      where: 'remote_id = ?',
      whereArgs: [contact.remoteId],
      limit: 1,
    );
    if (existing.isEmpty) {
      final map = contact.toMap()..remove('id');
      await db.insert('contacts', map);
    } else {
      final localId = existing.first['id'] as int;
      await db.update(
        'contacts',
        contact.toMap()..['id'] = localId,
        where: 'id = ?',
        whereArgs: [localId],
      );
    }
  }

  Future<void> clearContacts() async {
    final db = await database;
    await db.delete('contacts');
  }

  // ─── Kanban Boards ────────────────────────────────────────────────────────

  Future<List<KanbanBoard>> getBoards() async {
    final db = await database;
    final rows = await db.query('kanban_boards', orderBy: 'order_idx ASC');
    return rows.map(KanbanBoard.fromMap).toList();
  }

  Future<int> insertBoard(KanbanBoard board) async {
    final db = await database;
    final map = board.toMap()..remove('id');
    return db.insert('kanban_boards', map);
  }

  Future<void> updateBoard(KanbanBoard board) async {
    final db = await database;
    await db.update(
      'kanban_boards',
      board.toMap(),
      where: 'id = ?',
      whereArgs: [board.id],
    );
  }

  Future<void> upsertBoardByRemoteId(KanbanBoard board) async {
    final db = await database;
    final existing = await db.query(
      'kanban_boards',
      where: 'remote_id = ?',
      whereArgs: [board.remoteId],
      limit: 1,
    );
    if (existing.isEmpty) {
      final map = board.toMap()..remove('id');
      await db.insert('kanban_boards', map);
    } else {
      final localId = existing.first['id'] as int;
      await db.update(
        'kanban_boards',
        board.toMap()..['id'] = localId,
        where: 'id = ?',
        whereArgs: [localId],
      );
    }
  }

  Future<KanbanBoard?> getBoardByRemoteId(int remoteId) async {
    final db = await database;
    final rows = await db.query(
      'kanban_boards',
      where: 'remote_id = ?',
      whereArgs: [remoteId],
      limit: 1,
    );
    if (rows.isEmpty) return null;
    return KanbanBoard.fromMap(rows.first);
  }

  Future<void> clearBoards() async {
    final db = await database;
    await db.delete('kanban_boards');
  }

  // ─── Kanban Projects ──────────────────────────────────────────────────────

  Future<List<KanbanProject>> getProjectsByBoard(int boardId) async {
    final db = await database;
    final rows = await db.query(
      'kanban_projects',
      where: 'board_id = ?',
      whereArgs: [boardId],
      orderBy: 'order_idx ASC',
    );
    return rows.map(KanbanProject.fromMap).toList();
  }

  Future<KanbanProject?> getProjectById(int id) async {
    final db = await database;
    final rows = await db.query(
      'kanban_projects',
      where: 'id = ?',
      whereArgs: [id],
      limit: 1,
    );
    if (rows.isEmpty) return null;
    return KanbanProject.fromMap(rows.first);
  }

  Future<int> insertProject(KanbanProject project) async {
    final db = await database;
    final map = project.toMap()..remove('id');
    return db.insert('kanban_projects', map);
  }

  Future<void> updateProject(KanbanProject project) async {
    final db = await database;
    await db.update(
      'kanban_projects',
      project.toMap(),
      where: 'id = ?',
      whereArgs: [project.id],
    );
  }

  Future<void> deleteProject(int id) async {
    final db = await database;
    await db.delete('kanban_projects', where: 'id = ?', whereArgs: [id]);
  }

  Future<void> upsertProjectByRemoteId(KanbanProject project) async {
    final db = await database;
    final existing = await db.query(
      'kanban_projects',
      where: 'remote_id = ?',
      whereArgs: [project.remoteId],
      limit: 1,
    );
    if (existing.isEmpty) {
      final map = project.toMap()..remove('id');
      await db.insert('kanban_projects', map);
    } else {
      final localId = existing.first['id'] as int;
      await db.update(
        'kanban_projects',
        project.toMap()..['id'] = localId,
        where: 'id = ?',
        whereArgs: [localId],
      );
    }
  }

  Future<KanbanProject?> getProjectByRemoteId(int remoteId) async {
    final db = await database;
    final rows = await db.query(
      'kanban_projects',
      where: 'remote_id = ?',
      whereArgs: [remoteId],
      limit: 1,
    );
    if (rows.isEmpty) return null;
    return KanbanProject.fromMap(rows.first);
  }

  Future<void> clearProjects() async {
    final db = await database;
    await db.delete('kanban_projects');
  }

  // ─── Kanban Columns ───────────────────────────────────────────────────────

  Future<List<KanbanColumn>> getColumnsByProject(int projectId) async {
    final db = await database;
    final rows = await db.query(
      'kanban_columns',
      where: 'project_id = ?',
      whereArgs: [projectId],
      orderBy: 'order_idx ASC',
    );
    return rows.map(KanbanColumn.fromMap).toList();
  }

  Future<KanbanColumn?> getColumnById(int id) async {
    final db = await database;
    final rows = await db.query(
      'kanban_columns',
      where: 'id = ?',
      whereArgs: [id],
      limit: 1,
    );
    if (rows.isEmpty) return null;
    return KanbanColumn.fromMap(rows.first);
  }

  Future<int> insertColumn(KanbanColumn column) async {
    final db = await database;
    final map = column.toMap()..remove('id');
    return db.insert('kanban_columns', map);
  }

  Future<void> updateColumn(KanbanColumn column) async {
    final db = await database;
    await db.update(
      'kanban_columns',
      column.toMap(),
      where: 'id = ?',
      whereArgs: [column.id],
    );
  }

  Future<void> deleteColumn(int id) async {
    final db = await database;
    await db.delete('kanban_columns', where: 'id = ?', whereArgs: [id]);
  }

  Future<void> upsertColumnByRemoteId(KanbanColumn column) async {
    final db = await database;
    final existing = await db.query(
      'kanban_columns',
      where: 'remote_id = ?',
      whereArgs: [column.remoteId],
      limit: 1,
    );
    if (existing.isEmpty) {
      final map = column.toMap()..remove('id');
      await db.insert('kanban_columns', map);
    } else {
      final localId = existing.first['id'] as int;
      await db.update(
        'kanban_columns',
        column.toMap()..['id'] = localId,
        where: 'id = ?',
        whereArgs: [localId],
      );
    }
  }

  Future<KanbanColumn?> getColumnByRemoteId(int remoteId) async {
    final db = await database;
    final rows = await db.query(
      'kanban_columns',
      where: 'remote_id = ?',
      whereArgs: [remoteId],
      limit: 1,
    );
    if (rows.isEmpty) return null;
    return KanbanColumn.fromMap(rows.first);
  }

  Future<void> clearColumns() async {
    final db = await database;
    await db.delete('kanban_columns');
  }

  // ─── Kanban Cards ─────────────────────────────────────────────────────────

  Future<List<KanbanCard>> getCardsByColumn(int columnId) async {
    final db = await database;
    final rows = await db.query(
      'kanban_cards',
      where: 'column_id = ?',
      whereArgs: [columnId],
      orderBy: 'order_idx ASC',
    );
    return rows.map(KanbanCard.fromMap).toList();
  }

  Future<KanbanCard?> getCardById(int id) async {
    final db = await database;
    final rows = await db.query(
      'kanban_cards',
      where: 'id = ?',
      whereArgs: [id],
      limit: 1,
    );
    if (rows.isEmpty) return null;
    return KanbanCard.fromMap(rows.first);
  }

  Future<int> insertCard(KanbanCard card) async {
    final db = await database;
    final map = card.toMap()..remove('id');
    return db.insert('kanban_cards', map);
  }

  Future<void> updateCard(KanbanCard card) async {
    final db = await database;
    await db.update(
      'kanban_cards',
      card.toMap(),
      where: 'id = ?',
      whereArgs: [card.id],
    );
  }

  Future<void> deleteCard(int id) async {
    final db = await database;
    await db.delete('kanban_cards', where: 'id = ?', whereArgs: [id]);
  }

  Future<void> upsertCardByRemoteId(KanbanCard card) async {
    final db = await database;
    final existing = await db.query(
      'kanban_cards',
      where: 'remote_id = ?',
      whereArgs: [card.remoteId],
      limit: 1,
    );
    if (existing.isEmpty) {
      final map = card.toMap()..remove('id');
      await db.insert('kanban_cards', map);
    } else {
      final localId = existing.first['id'] as int;
      await db.update(
        'kanban_cards',
        card.toMap()..['id'] = localId,
        where: 'id = ?',
        whereArgs: [localId],
      );
    }
  }

  Future<void> clearCards() async {
    final db = await database;
    await db.delete('kanban_cards');
  }

  Future<void> clearKanban() async {
    await clearCards();
    await clearColumns();
    await clearProjects();
    await clearBoards();
  }
}
