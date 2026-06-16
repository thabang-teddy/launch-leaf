import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../utils/url_resolver.dart';

class ApiClient {
  ApiClient._();
  static final ApiClient instance = ApiClient._();

  Dio? _dio;

  Dio get dio {
    _dio ??= _buildDio();
    return _dio!;
  }

  Dio _buildDio() {
    final dio = Dio(BaseOptions(
      connectTimeout: const Duration(seconds: 15),
      receiveTimeout: const Duration(seconds: 30),
      headers: {'Accept': 'application/json', 'Content-Type': 'application/json'},
    ));

    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final prefs = await SharedPreferences.getInstance();
        final savedUrl = prefs.getString('base_url') ?? 'http://127.0.0.1:8000';
        final token = prefs.getString('auth_token');
        final resolved = UrlResolver.resolve(savedUrl);

        options.baseUrl = resolved.url;
        if (resolved.hostHeader != null) {
          options.headers['Host'] = resolved.hostHeader!;
        }
        if (token != null && token.isNotEmpty) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (error, handler) {
        return handler.next(error);
      },
    ));

    return dio;
  }

  void resetClient() {
    _dio = null;
  }

  Future<Response<T>> get<T>(String path, {Map<String, dynamic>? queryParameters}) {
    return dio.get<T>(path, queryParameters: queryParameters);
  }

  Future<Response<T>> post<T>(String path, {dynamic data}) {
    return dio.post<T>(path, data: data);
  }

  Future<Response<T>> put<T>(String path, {dynamic data}) {
    return dio.put<T>(path, data: data);
  }

  Future<Response<T>> patch<T>(String path, {dynamic data}) {
    return dio.patch<T>(path, data: data);
  }

  Future<Response<T>> delete<T>(String path) {
    return dio.delete<T>(path);
  }
}
