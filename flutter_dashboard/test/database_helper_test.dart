import 'dart:convert';

import 'package:flutter_dashboard/core/database/database_helper.dart';
import 'package:flutter_dashboard/models/kanban_models.dart';
import 'package:flutter_dashboard/models/sync_change_model.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:sqflite_common_ffi/sqflite_ffi.dart';

void main() {
  setUpAll(() {
    sqfliteFfiInit();
    databaseFactory = databaseFactoryFfi;
    DatabaseHelper.debugDatabasePath = inMemoryDatabasePath;
  });

  final db = DatabaseHelper.instance;

  group('updateChildRemoteReferences', () {
    test(
      'stamps parent remote id onto child rows and pending change payloads',
      () async {
        final boardId = await db.insertBoard(
          const KanbanBoard(
            id: 0,
            name: 'Board',
            description: '',
            color: '#111',
          ),
        );

        final projectId = await db.insertProject(
          KanbanProject(
            id: 0,
            boardId: boardId,
            name: 'Project',
            description: '',
            color: '#222',
          ),
        );

        final otherBoardId = await db.insertBoard(
          const KanbanBoard(
            id: 0,
            name: 'Other board',
            description: '',
            color: '#333',
          ),
        );
        final unrelatedProjectId = await db.insertProject(
          KanbanProject(
            id: 0,
            boardId: otherBoardId,
            name: 'Unrelated',
            description: '',
            color: '#444',
          ),
        );

        // Pending create change recorded before the board synced —
        // remote_board_id is null in the payload.
        final project = (await db.getProjectsByBoard(boardId)).single;
        await db.upsertChange(
          SyncChange(
            localId: projectId,
            tableName: 'kanban_projects',
            actionType: 'create',
            datetime: DateTime.now().toUtc().toIso8601String(),
            data: jsonEncode(project.toMap()),
          ),
        );

        await db.updateChildRemoteReferences(
          'kanban_boards',
          boardId,
          'uuid-board-1',
        );

        final updatedProject = (await db.getProjectsByBoard(boardId)).single;
        expect(updatedProject.remoteBoardId, 'uuid-board-1');

        final unrelated = (await db.getProjectsByBoard(otherBoardId)).single;
        expect(
          unrelated.remoteBoardId,
          isNull,
          reason: 'children of other parents must not be touched',
        );
        expect(unrelated.id, unrelatedProjectId);

        final pending = await db.getPendingChanges();
        final patched = pending.singleWhere((c) => c.localId == projectId).data;
        final payload = jsonDecode(patched) as Map<String, dynamic>;
        expect(payload['remote_board_id'], 'uuid-board-1');
      },
    );

    test('is a no-op for tables without child links', () async {
      await db.updateChildRemoteReferences('notes', 1, 'remote-1');
      // No throw — nothing to assert beyond completion.
    });
  });

  group('updateRemoteId', () {
    test('ignores table names outside the sync whitelist', () async {
      await db.updateRemoteId('sqlite_master; DROP TABLE notes;', 1, 'x');
      final notes = await db.getNotes();
      expect(notes, isEmpty); // table still exists and is queryable
    });
  });
}
