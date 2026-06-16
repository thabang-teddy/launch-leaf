class TaskModel {
  const TaskModel({
    required this.id,
    this.remoteId,
    required this.title,
    required this.description,
    required this.isCompleted,
    this.completedAt,
    this.dueDate,
    this.orderIdx = 0,
    required this.createdAt,
    required this.updatedAt,
    this.syncStatus = 'synced',
  });

  final int id;
  final int? remoteId;
  final String title;
  final String description;
  final bool isCompleted;
  final String? completedAt;
  final String? dueDate;
  final int orderIdx;
  final String createdAt;
  final String updatedAt;
  final String syncStatus;

  TaskModel copyWith({
    int? id,
    int? remoteId,
    String? title,
    String? description,
    bool? isCompleted,
    String? completedAt,
    String? dueDate,
    int? orderIdx,
    String? createdAt,
    String? updatedAt,
    String? syncStatus,
  }) {
    return TaskModel(
      id: id ?? this.id,
      remoteId: remoteId ?? this.remoteId,
      title: title ?? this.title,
      description: description ?? this.description,
      isCompleted: isCompleted ?? this.isCompleted,
      completedAt: completedAt ?? this.completedAt,
      dueDate: dueDate ?? this.dueDate,
      orderIdx: orderIdx ?? this.orderIdx,
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
      'description': description,
      'is_completed': isCompleted ? 1 : 0,
      'completed_at': completedAt,
      'due_date': dueDate,
      'order_idx': orderIdx,
      'created_at': createdAt,
      'updated_at': updatedAt,
      'sync_status': syncStatus,
    };
  }

  factory TaskModel.fromMap(Map<String, dynamic> map) {
    return TaskModel(
      id: map['id'] as int,
      remoteId: map['remote_id'] as int?,
      title: map['title'] as String? ?? '',
      description: map['description'] as String? ?? '',
      isCompleted: (map['is_completed'] as int? ?? 0) == 1,
      completedAt: map['completed_at'] as String?,
      dueDate: map['due_date'] as String?,
      orderIdx: map['order_idx'] as int? ?? 0,
      createdAt: map['created_at'] as String? ?? '',
      updatedAt: map['updated_at'] as String? ?? '',
      syncStatus: map['sync_status'] as String? ?? 'synced',
    );
  }

  factory TaskModel.fromApi(Map<String, dynamic> json) {
    return TaskModel(
      id: 0,
      remoteId: json['id'] as int?,
      title: json['title'] as String? ?? '',
      description: json['description'] as String? ?? '',
      isCompleted: json['is_completed'] == true || json['is_completed'] == 1,
      completedAt: json['completed_at'] as String?,
      dueDate: json['due_date'] as String?,
      orderIdx: json['order'] as int? ?? 0,
      createdAt: json['created_at'] as String? ?? '',
      updatedAt: json['updated_at'] as String? ?? '',
      syncStatus: 'synced',
    );
  }

  Map<String, dynamic> toApiPayload() {
    return {
      'title': title,
      'description': description,
      'due_date': dueDate,
      'is_completed': isCompleted,
    };
  }
}
