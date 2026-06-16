import 'package:flutter/foundation.dart';

import '../core/api/sync_service.dart';
import '../core/database/database_helper.dart';
import '../models/contact_model.dart';

class ContactProvider extends ChangeNotifier {
  List<ContactModel> _contacts = [];
  bool _isLoading = false;
  bool _isReplying = false;
  String? _errorMessage;

  List<ContactModel> get contacts => _contacts;
  List<ContactModel> get pending => _contacts.where((c) => !c.isReplied).toList();
  bool get isLoading => _isLoading;
  bool get isReplying => _isReplying;
  String? get errorMessage => _errorMessage;
  int get totalCount => _contacts.length;
  int get pendingCount => pending.length;

  /// Syncs from API then reads SQLite. Used when navigating to the screen.
  Future<void> loadContacts() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await SyncService.instance.syncContacts();
    } catch (_) {
      // Sync failed — will display whatever is already in local DB.
    }

    try {
      _contacts = await DatabaseHelper.instance.getContacts();
    } on Exception catch (e) {
      _errorMessage = 'Failed to load contacts: ${e.toString()}';
    }

    _isLoading = false;
    notifyListeners();
  }

  /// Reads SQLite only — no API call. Used after an explicit sync completes.
  Future<void> reloadFromLocal() async {
    try {
      _contacts = await DatabaseHelper.instance.getContacts();
      notifyListeners();
    } on Exception {
      // ignore
    }
  }

  Future<bool> replyContact(ContactModel contact, String reply) async {
    _isReplying = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await SyncService.instance.replyContact(contact, reply);
      final now = DateTime.now().toIso8601String();
      final updated = contact.copyWith(reply: reply, repliedAt: now);
      final idx = _contacts.indexWhere((c) => c.id == contact.id);
      if (idx != -1) {
        _contacts[idx] = updated;
      }
      _isReplying = false;
      notifyListeners();
      return true;
    } on Exception catch (e) {
      _errorMessage = 'Failed to send reply: ${e.toString()}';
      _isReplying = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> deleteContact(ContactModel contact) async {
    try {
      await SyncService.instance.deleteContact(contact);
      _contacts.removeWhere((c) => c.id == contact.id);
      notifyListeners();
    } on Exception catch (e) {
      _errorMessage = 'Failed to delete contact: ${e.toString()}';
      notifyListeners();
    }
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}
