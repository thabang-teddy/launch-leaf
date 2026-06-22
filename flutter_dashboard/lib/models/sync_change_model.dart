import 'dart:convert';

class SyncChange {
  const SyncChange({
    this.id,
    required this.localId,
    this.remoteId,
    required this.tableName,
    required this.actionType,
    required this.datetime,
    required this.data,
  });

  final int? id;
  final int localId;
  final String? remoteId;

  /// One of: 'notes', 'tasks', 'contacts', 'kanban_boards',
  /// 'kanban_projects', 'kanban_columns', 'kanban_cards'
  final String tableName;

  /// One of: 'create', 'update', 'delete'
  final String actionType;

  /// ISO 8601 updated_at of the item at the time the change was recorded.
  final String datetime;

  /// JSON string of the full item (from toMap()).
  final String data;

  SyncChange copyWith({
    int? id,
    int? localId,
    String? remoteId,
    String? tableName,
    String? actionType,
    String? datetime,
    String? data,
  }) =>
      SyncChange(
        id: id ?? this.id,
        localId: localId ?? this.localId,
        remoteId: remoteId ?? this.remoteId,
        tableName: tableName ?? this.tableName,
        actionType: actionType ?? this.actionType,
        datetime: datetime ?? this.datetime,
        data: data ?? this.data,
      );

  Map<String, dynamic> toMap() => {
        'id': id,
        'local_id': localId,
        'remote_id': remoteId,
        'table_name': tableName,
        'action_type': actionType,
        'datetime': datetime,
        'data': data,
      };

  factory SyncChange.fromMap(Map<String, dynamic> map) => SyncChange(
        id: map['id'] as int?,
        localId: map['local_id'] as int,
        remoteId: map['remote_id'] as String?,
        tableName: map['table_name'] as String,
        actionType: map['action_type'] as String,
        datetime: map['datetime'] as String,
        data: map['data'] as String,
      );

  /// Payload sent to POST /api/sync/changes — data is decoded from JSON
  /// string into a nested object so it is not double-encoded.
  Map<String, dynamic> toApiPayload() => {
        'local_id': localId,
        'remote_id': remoteId,
        'table_name': tableName,
        'action_type': actionType,
        'datetime': datetime,
        'data': jsonDecode(data),
      };
}

class SyncChangeResult {
  const SyncChangeResult({
    required this.localId,
    this.remoteId,
    required this.tableName,
    required this.actionType,
    required this.datetime,
    this.data,
    required this.syncedSuccess,
  });

  final int localId;
  final String? remoteId;
  final String tableName;
  final String actionType;
  final String datetime;

  /// Server item object returned on success or conflict.
  /// Null on delete or when a network/server error leaves the change pending.
  final Map<String, dynamic>? data;

  /// true  → change applied; delete the change record (update remote_id if create)
  /// false → conflict; if data != null apply server data locally, then delete record
  ///          if data == null a network/server error occurred; leave record for retry
  final bool syncedSuccess;

  factory SyncChangeResult.fromJson(Map<String, dynamic> json) =>
      SyncChangeResult(
        localId: json['local_id'] as int,
        remoteId: json['remote_id']?.toString(),
        tableName: json['table_name'] as String,
        actionType: json['action_type'] as String,
        datetime: json['datetime'] as String? ?? '',
        data: json['data'] as Map<String, dynamic>?,
        syncedSuccess: json['synced_success'] as bool,
      );
}
