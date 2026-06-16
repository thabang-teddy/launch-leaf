class KanbanBoard {
  const KanbanBoard({
    required this.id,
    this.remoteId,
    required this.name,
    required this.description,
    required this.color,
    this.orderIdx = 0,
    this.syncStatus = 'synced',
  });

  final int id;
  final int? remoteId;
  final String name;
  final String description;
  final String color;
  final int orderIdx;
  final String syncStatus;

  KanbanBoard copyWith({
    int? id,
    int? remoteId,
    String? name,
    String? description,
    String? color,
    int? orderIdx,
    String? syncStatus,
  }) {
    return KanbanBoard(
      id: id ?? this.id,
      remoteId: remoteId ?? this.remoteId,
      name: name ?? this.name,
      description: description ?? this.description,
      color: color ?? this.color,
      orderIdx: orderIdx ?? this.orderIdx,
      syncStatus: syncStatus ?? this.syncStatus,
    );
  }

  Map<String, dynamic> toMap() => {
        'id': id,
        'remote_id': remoteId,
        'name': name,
        'description': description,
        'color': color,
        'order_idx': orderIdx,
        'sync_status': syncStatus,
      };

  factory KanbanBoard.fromMap(Map<String, dynamic> map) => KanbanBoard(
        id: map['id'] as int,
        remoteId: map['remote_id'] as int?,
        name: map['name'] as String? ?? '',
        description: map['description'] as String? ?? '',
        color: map['color'] as String? ?? '#1a1a2e',
        orderIdx: map['order_idx'] as int? ?? 0,
        syncStatus: map['sync_status'] as String? ?? 'synced',
      );

  factory KanbanBoard.fromApi(Map<String, dynamic> json) => KanbanBoard(
        id: 0,
        remoteId: json['id'] as int?,
        name: json['name'] as String? ?? '',
        description: json['description'] as String? ?? '',
        color: json['color'] as String? ?? '#1a1a2e',
        orderIdx: json['order_idx'] as int? ?? 0,
        syncStatus: 'synced',
      );
}

class KanbanProject {
  const KanbanProject({
    required this.id,
    this.remoteId,
    required this.boardId,
    this.remoteBoardId,
    required this.name,
    required this.description,
    required this.color,
    this.orderIdx = 0,
    this.syncStatus = 'synced',
    this.columns = const [],
  });

  final int id;
  final int? remoteId;
  final int boardId;
  final int? remoteBoardId;
  final String name;
  final String description;
  final String color;
  final int orderIdx;
  final String syncStatus;
  final List<KanbanColumn> columns;

  KanbanProject copyWith({
    int? id,
    int? remoteId,
    int? boardId,
    int? remoteBoardId,
    String? name,
    String? description,
    String? color,
    int? orderIdx,
    String? syncStatus,
    List<KanbanColumn>? columns,
  }) {
    return KanbanProject(
      id: id ?? this.id,
      remoteId: remoteId ?? this.remoteId,
      boardId: boardId ?? this.boardId,
      remoteBoardId: remoteBoardId ?? this.remoteBoardId,
      name: name ?? this.name,
      description: description ?? this.description,
      color: color ?? this.color,
      orderIdx: orderIdx ?? this.orderIdx,
      syncStatus: syncStatus ?? this.syncStatus,
      columns: columns ?? this.columns,
    );
  }

  Map<String, dynamic> toMap() => {
        'id': id,
        'remote_id': remoteId,
        'board_id': boardId,
        'remote_board_id': remoteBoardId,
        'name': name,
        'description': description,
        'color': color,
        'order_idx': orderIdx,
        'sync_status': syncStatus,
      };

  factory KanbanProject.fromMap(Map<String, dynamic> map) => KanbanProject(
        id: map['id'] as int,
        remoteId: map['remote_id'] as int?,
        boardId: map['board_id'] as int? ?? 0,
        remoteBoardId: map['remote_board_id'] as int?,
        name: map['name'] as String? ?? '',
        description: map['description'] as String? ?? '',
        color: map['color'] as String? ?? '#e74c3c',
        orderIdx: map['order_idx'] as int? ?? 0,
        syncStatus: map['sync_status'] as String? ?? 'synced',
      );

  factory KanbanProject.fromApi(
    Map<String, dynamic> json,
    int localBoardId,
  ) =>
      KanbanProject(
        id: 0,
        remoteId: json['id'] as int?,
        boardId: localBoardId,
        remoteBoardId: json['board_id'] as int?,
        name: json['name'] as String? ?? '',
        description: json['description'] as String? ?? '',
        color: json['color'] as String? ?? '#e74c3c',
        orderIdx: json['order_idx'] as int? ?? 0,
        syncStatus: 'synced',
      );
}

class KanbanColumn {
  const KanbanColumn({
    required this.id,
    this.remoteId,
    required this.projectId,
    this.remoteProjectId,
    required this.title,
    required this.color,
    this.orderIdx = 0,
    this.syncStatus = 'synced',
    this.cards = const [],
  });

  final int id;
  final int? remoteId;
  final int projectId;
  final int? remoteProjectId;
  final String title;
  final String color;
  final int orderIdx;
  final String syncStatus;
  final List<KanbanCard> cards;

  KanbanColumn copyWith({
    int? id,
    int? remoteId,
    int? projectId,
    int? remoteProjectId,
    String? title,
    String? color,
    int? orderIdx,
    String? syncStatus,
    List<KanbanCard>? cards,
  }) {
    return KanbanColumn(
      id: id ?? this.id,
      remoteId: remoteId ?? this.remoteId,
      projectId: projectId ?? this.projectId,
      remoteProjectId: remoteProjectId ?? this.remoteProjectId,
      title: title ?? this.title,
      color: color ?? this.color,
      orderIdx: orderIdx ?? this.orderIdx,
      syncStatus: syncStatus ?? this.syncStatus,
      cards: cards ?? this.cards,
    );
  }

  Map<String, dynamic> toMap() => {
        'id': id,
        'remote_id': remoteId,
        'project_id': projectId,
        'remote_project_id': remoteProjectId,
        'title': title,
        'color': color,
        'order_idx': orderIdx,
        'sync_status': syncStatus,
      };

  factory KanbanColumn.fromMap(Map<String, dynamic> map) => KanbanColumn(
        id: map['id'] as int,
        remoteId: map['remote_id'] as int?,
        projectId: map['project_id'] as int? ?? 0,
        remoteProjectId: map['remote_project_id'] as int?,
        title: map['title'] as String? ?? '',
        color: map['color'] as String? ?? '#1a1a2e',
        orderIdx: map['order_idx'] as int? ?? 0,
        syncStatus: map['sync_status'] as String? ?? 'synced',
      );

  factory KanbanColumn.fromApi(
    Map<String, dynamic> json,
    int localProjectId,
  ) =>
      KanbanColumn(
        id: 0,
        remoteId: json['id'] as int?,
        projectId: localProjectId,
        remoteProjectId: json['project_id'] as int?,
        title: json['title'] as String? ?? '',
        color: json['color'] as String? ?? '#1a1a2e',
        orderIdx: json['order_idx'] as int? ?? 0,
        syncStatus: 'synced',
      );
}

class KanbanCard {
  const KanbanCard({
    required this.id,
    this.remoteId,
    required this.columnId,
    this.remoteColumnId,
    required this.title,
    required this.description,
    this.dueDate,
    this.orderIdx = 0,
    this.syncStatus = 'synced',
  });

  final int id;
  final int? remoteId;
  final int columnId;
  final int? remoteColumnId;
  final String title;
  final String description;
  final String? dueDate;
  final int orderIdx;
  final String syncStatus;

  KanbanCard copyWith({
    int? id,
    int? remoteId,
    int? columnId,
    int? remoteColumnId,
    String? title,
    String? description,
    String? dueDate,
    int? orderIdx,
    String? syncStatus,
  }) {
    return KanbanCard(
      id: id ?? this.id,
      remoteId: remoteId ?? this.remoteId,
      columnId: columnId ?? this.columnId,
      remoteColumnId: remoteColumnId ?? this.remoteColumnId,
      title: title ?? this.title,
      description: description ?? this.description,
      dueDate: dueDate ?? this.dueDate,
      orderIdx: orderIdx ?? this.orderIdx,
      syncStatus: syncStatus ?? this.syncStatus,
    );
  }

  Map<String, dynamic> toMap() => {
        'id': id,
        'remote_id': remoteId,
        'column_id': columnId,
        'remote_column_id': remoteColumnId,
        'title': title,
        'description': description,
        'due_date': dueDate,
        'order_idx': orderIdx,
        'sync_status': syncStatus,
      };

  factory KanbanCard.fromMap(Map<String, dynamic> map) => KanbanCard(
        id: map['id'] as int,
        remoteId: map['remote_id'] as int?,
        columnId: map['column_id'] as int? ?? 0,
        remoteColumnId: map['remote_column_id'] as int?,
        title: map['title'] as String? ?? '',
        description: map['description'] as String? ?? '',
        dueDate: map['due_date'] as String?,
        orderIdx: map['order_idx'] as int? ?? 0,
        syncStatus: map['sync_status'] as String? ?? 'synced',
      );

  factory KanbanCard.fromApi(
    Map<String, dynamic> json,
    int localColumnId,
  ) =>
      KanbanCard(
        id: 0,
        remoteId: json['id'] as int?,
        columnId: localColumnId,
        remoteColumnId: json['column_id'] as int?,
        title: json['title'] as String? ?? '',
        description: json['description'] as String? ?? '',
        dueDate: json['due_date'] as String?,
        orderIdx: json['order_idx'] as int? ?? 0,
        syncStatus: 'synced',
      );
}
