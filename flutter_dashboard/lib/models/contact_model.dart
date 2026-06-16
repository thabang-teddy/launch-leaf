class ContactModel {
  const ContactModel({
    required this.id,
    this.remoteId,
    required this.name,
    required this.email,
    required this.subject,
    required this.message,
    this.reply,
    this.repliedAt,
    required this.createdAt,
    required this.updatedAt,
    this.syncStatus = 'synced',
  });

  final int id;
  final int? remoteId;
  final String name;
  final String email;
  final String subject;
  final String message;
  final String? reply;
  final String? repliedAt;
  final String createdAt;
  final String updatedAt;
  final String syncStatus;

  bool get isReplied => repliedAt != null && repliedAt!.isNotEmpty;

  ContactModel copyWith({
    int? id,
    int? remoteId,
    String? name,
    String? email,
    String? subject,
    String? message,
    String? reply,
    String? repliedAt,
    String? createdAt,
    String? updatedAt,
    String? syncStatus,
  }) {
    return ContactModel(
      id: id ?? this.id,
      remoteId: remoteId ?? this.remoteId,
      name: name ?? this.name,
      email: email ?? this.email,
      subject: subject ?? this.subject,
      message: message ?? this.message,
      reply: reply ?? this.reply,
      repliedAt: repliedAt ?? this.repliedAt,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      syncStatus: syncStatus ?? this.syncStatus,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'remote_id': remoteId,
      'name': name,
      'email': email,
      'subject': subject,
      'message': message,
      'reply': reply,
      'replied_at': repliedAt,
      'created_at': createdAt,
      'updated_at': updatedAt,
      'sync_status': syncStatus,
    };
  }

  factory ContactModel.fromMap(Map<String, dynamic> map) {
    return ContactModel(
      id: map['id'] as int,
      remoteId: map['remote_id'] as int?,
      name: map['name'] as String? ?? '',
      email: map['email'] as String? ?? '',
      subject: map['subject'] as String? ?? '',
      message: map['message'] as String? ?? '',
      reply: map['reply'] as String?,
      repliedAt: map['replied_at'] as String?,
      createdAt: map['created_at'] as String? ?? '',
      updatedAt: map['updated_at'] as String? ?? '',
      syncStatus: map['sync_status'] as String? ?? 'synced',
    );
  }

  factory ContactModel.fromApi(Map<String, dynamic> json) {
    return ContactModel(
      id: 0,
      remoteId: json['id'] as int?,
      name: json['name'] as String? ?? '',
      email: json['email'] as String? ?? '',
      subject: json['subject'] as String? ?? '',
      message: json['message'] as String? ?? '',
      reply: json['reply'] as String?,
      repliedAt: json['replied_at'] as String?,
      createdAt: json['created_at'] as String? ?? '',
      updatedAt: json['updated_at'] as String? ?? '',
      syncStatus: 'synced',
    );
  }
}
