import 'package:sqflite/sqflite.dart';

import '../../models/contact_model.dart';
import '../../models/kanban_models.dart';
import '../../models/note_model.dart';
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
      version: 1,
      onCreate: _onCreate,
    );
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

    await db.execute('''
      CREATE TABLE kanban_boards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        remote_id INTEGER,
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
        remote_id INTEGER,
        board_id INTEGER,
        remote_board_id INTEGER,
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
        remote_id INTEGER,
        project_id INTEGER,
        remote_project_id INTEGER,
        title TEXT,
        color TEXT,
        order_idx INTEGER DEFAULT 0,
        sync_status TEXT DEFAULT 'synced'
      )
    ''');

    await db.execute('''
      CREATE TABLE kanban_cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        remote_id INTEGER,
        column_id INTEGER,
        remote_column_id INTEGER,
        title TEXT,
        description TEXT,
        due_date TEXT,
        order_idx INTEGER DEFAULT 0,
        sync_status TEXT DEFAULT 'synced'
      )
    ''');
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
    final rows = await db.query('tasks', orderBy: 'order_idx ASC, created_at DESC');
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

  Future<int> insertProject(KanbanProject project) async {
    final db = await database;
    final map = project.toMap()..remove('id');
    return db.insert('kanban_projects', map);
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

  Future<int> insertColumn(KanbanColumn column) async {
    final db = await database;
    final map = column.toMap()..remove('id');
    return db.insert('kanban_columns', map);
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

  Future<int> insertCard(KanbanCard card) async {
    final db = await database;
    final map = card.toMap()..remove('id');
    return db.insert('kanban_cards', map);
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
