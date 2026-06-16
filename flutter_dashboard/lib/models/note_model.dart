class NoteModel {
  const NoteModel({
    required this.id,
    this.remoteId,
    required this.title,
    required this.content,
    required this.createdAt,
    required this.updatedAt,
    this.syncStatus = 'synced',
  });

  final int id;
  final int? remoteId;
  final String title;
  final String content;
  final String createdAt;
  final String updatedAt;
  final String syncStatus;

  NoteModel copyWith({
    int? id,
    int? remoteId,
    String? title,
    String? content,
    String? createdAt,
    String? updatedAt,
    String? syncStatus,
  }) {
    return NoteModel(
      id: id ?? this.id,
      remoteId: remoteId ?? this.remoteId,
      title: title ?? this.title,
      content: content ?? this.content,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      syncStatus: syncStatus ?? this.syncStatus,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'remote_id': remoteId,
      'title': title,
      'content': content,
      'created_at': createdAt,
      'updated_at': updatedAt,
      'sync_status': syncStatus,
    };
  }

  factory NoteModel.fromMap(Map<String, dynamic> map) {
    return NoteModel(
      id: map['id'] as int,
      remoteId: map['remote_id'] as int?,
      title: map['title'] as String? ?? '',
      content: map['content'] as String? ?? '',
      createdAt: map['created_at'] as String? ?? '',
      updatedAt: map['updated_at'] as String? ?? '',
      syncStatus: map['sync_status'] as String? ?? 'synced',
    );
  }

  factory NoteModel.fromApi(Map<String, dynamic> json) {
    return NoteModel(
      id: 0,
      remoteId: json['id'] as int?,
      title: json['title'] as String? ?? '',
      content: json['content'] as String? ?? '',
      createdAt: json['created_at'] as String? ?? '',
      updatedAt: json['updated_at'] as String? ?? '',
      syncStatus: 'synced',
    );
  }

  Map<String, dynamic> toApiPayload() {
    return {
      'title': title,
      'content': content,
    };
  }
}
