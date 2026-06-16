import 'package:flutter/foundation.dart';

import '../core/api/auth_service.dart';

class AuthProvider extends ChangeNotifier {
  bool _isLoggedIn = false;
  bool _isLoading = false;
  String? _errorMessage;
  String? _userEmail;

  bool get isLoggedIn => _isLoggedIn;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  String? get userEmail => _userEmail;

  Future<void> checkAuthStatus() async {
    _isLoggedIn = await AuthService.instance.isLoggedIn();
    if (_isLoggedIn) {
      _userEmail = await AuthService.instance.getUserEmail();
    }
    notifyListeners();
  }

  Future<bool> login({
    required String baseUrl,
    required String email,
    required String password,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      await AuthService.instance.login(
        baseUrl: baseUrl,
        email: email,
        password: password,
      );
      _isLoggedIn = true;
      _userEmail = email;
      _isLoading = false;
      notifyListeners();
      return true;
    } on Exception catch (e) {
      _errorMessage = _parseError(e);
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    await AuthService.instance.logout();
    _isLoggedIn = false;
    _userEmail = null;
    notifyListeners();
  }

  String _parseError(Exception e) {
    final msg = e.toString();
    if (msg.contains('401') || msg.contains('Unauthenticated')) {
      return 'Invalid email or password.';
    }
    if (msg.contains('SocketException') || msg.contains('Connection refused')) {
      return 'Cannot connect to server. Check the URL and try again.';
    }
    if (msg.contains('timeout')) {
      return 'Connection timed out. Check your network.';
    }
    return 'Login failed. Please try again.';
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}
