import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../utils/url_resolver.dart';
import 'api_client.dart';

class AuthService {
  AuthService._();
  static final AuthService instance = AuthService._();

  Future<String> login({
    required String baseUrl,
    required String email,
    required String password,
  }) async {
    final cleanUrl = baseUrl.endsWith('/') ? baseUrl.substring(0, baseUrl.length - 1) : baseUrl;
    final resolved = UrlResolver.resolve(cleanUrl);

    final dio = Dio(BaseOptions(
      baseUrl: resolved.url,
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 30),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        if (resolved.hostHeader != null) 'Host': resolved.hostHeader!,
      },
    ));

    final response = await dio.post<Map<String, dynamic>>(
      '/api/login',
      data: {'email': email, 'password': password},
    );

    final data = response.data;
    if (data == null) throw Exception('Empty response from server');

    final token = data['token'] as String?;
    if (token == null || token.isEmpty) {
      throw Exception('No token in response');
    }

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
    await prefs.setString('base_url', cleanUrl);
    await prefs.setString('user_email', email);

    ApiClient.instance.resetClient();

    return token;
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    ApiClient.instance.resetClient();
  }

  Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('auth_token');
    return token != null && token.isNotEmpty;
  }

  Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }

  Future<String?> getBaseUrl() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('base_url');
  }

  Future<String?> getUserEmail() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('user_email');
  }

  Future<void> updateBaseUrl(String baseUrl) async {
    final cleanUrl = baseUrl.endsWith('/') ? baseUrl.substring(0, baseUrl.length - 1) : baseUrl;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('base_url', cleanUrl);
    ApiClient.instance.resetClient();
  }
}
