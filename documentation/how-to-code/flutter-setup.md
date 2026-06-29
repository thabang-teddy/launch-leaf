# How to Recreate LaunchLeaf — Flutter App (Code Guide)

This guide walks a beginner through recreating the LaunchLeaf Flutter companion app from scratch. The Flutter app is a mobile and desktop dashboard that connects to the Laravel backend.

---

## What You Are Building

A cross-platform app (Android, Windows) that lets you manage your LaunchLeaf portfolio on the go. It connects to your Laravel site and provides:

- Login screen (authenticates against Laravel)
- Dashboard overview
- Notes (view, create, edit, delete)
- Tasks (checklist)
- Kanban board
- Contact messages
- Offline-capable local SQLite cache with background sync

**Tech you will use:** Dart, Flutter, Provider, Go Router, Dio, SQLite.

---

## Part 1 — Install the Tools

### 1.1 Install Flutter

Follow the official guide for your operating system: [https://flutter.dev/docs/get-started/install](https://flutter.dev/docs/get-started/install)

After installing, run:

```bash
flutter doctor
```

Fix any issues it reports before continuing.

### 1.2 Install an editor

Use VS Code with the **Flutter** and **Dart** extensions, or Android Studio.

### 1.3 Set up a device or emulator

- **Android emulator**: open Android Studio → Virtual Device Manager → create a device.
- **Physical Android phone**: enable Developer Options and USB Debugging, then plug it in.
- **Windows desktop**: Flutter supports Windows natively — no extra setup needed.

---

## Part 2 — Create the Flutter Project

```bash
flutter create flutter_dashboard
cd flutter_dashboard
```

This generates the starter project. The important folder is `lib/` — all your Dart code goes there.

---

## Part 3 — Add Dependencies

Open `pubspec.yaml` and add these packages under `dependencies:`:

```yaml
dependencies:
  flutter:
    sdk: flutter

  # Navigation
  go_router: ^14.6.2

  # State management
  provider: ^6.1.2

  # HTTP client
  dio: ^5.7.0

  # Local database
  sqflite: ^2.3.3+1
  sqflite_common_ffi: ^2.3.4+2   # needed for Windows/Linux desktop

  # Key-value storage (for saving the auth token)
  shared_preferences: ^2.3.3

  # Formatting dates
  intl: ^0.19.0

  cupertino_icons: ^1.0.8
```

Then run:

```bash
flutter pub get
```

---

## Part 4 — Project Structure

Organise `lib/` like this before writing any code — it makes navigation easier:

```
lib/
├── main.dart                  ← app entry point
├── app_router.dart            ← all navigation routes
├── core/
│   ├── api/
│   │   ├── api_client.dart    ← Dio HTTP client
│   │   ├── auth_service.dart  ← login/logout API calls
│   │   └── sync_service.dart  ← background sync
│   ├── constants/
│   │   └── app_colors.dart    ← colours and theme
│   ├── database/
│   │   └── database_helper.dart  ← SQLite setup
│   └── utils/
│       └── url_resolver.dart  ← picks the right base URL per platform
├── models/
│   ├── note_model.dart
│   ├── task_model.dart
│   ├── kanban_models.dart
│   └── contact_model.dart
├── providers/
│   ├── auth_provider.dart
│   ├── notes_provider.dart
│   ├── tasks_provider.dart
│   ├── kanban_provider.dart
│   └── contact_provider.dart
├── screens/
│   ├── login_screen.dart
│   ├── dashboard_screen.dart
│   ├── notes/
│   ├── tasks/
│   ├── kanban/
│   └── contact/
└── shared/
    └── widgets/
        ├── app_drawer.dart
        ├── ll_app_bar.dart
        └── ll_stat_card.dart
```

---

## Part 5 — Configure the HTTP Client

### 5.1 Create the URL resolver

Create `lib/core/utils/url_resolver.dart`. This returns the right base URL depending on whether the app is running on a phone (uses your PC's IP) or on Windows desktop (uses localhost):

```dart
import 'dart:io';
import 'package:flutter/foundation.dart';

String resolveBaseUrl() {
  if (kIsWeb) return 'http://127.0.0.1:8000';
  if (Platform.isAndroid) return 'http://10.0.2.2:8000'; // Android emulator
  return 'http://127.0.0.1:8000';                         // Windows desktop / iOS
}
```

> Replace `10.0.2.2` with your PC's local IP (e.g. `192.168.1.5`) when testing on a real phone.

### 5.2 Create the Dio API client

Create `lib/core/api/api_client.dart`:

```dart
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../utils/url_resolver.dart';

class ApiClient {
  static final Dio _dio = Dio(
    BaseOptions(
      baseUrl: resolveBaseUrl(),
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 30),
      headers: {'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest'},
    ),
  );

  static Dio get instance => _dio;

  static Future<void> setAuthToken(String token) async {
    _dio.options.headers['Authorization'] = 'Bearer $token';
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
  }

  static Future<void> loadSavedToken() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('auth_token');
    if (token != null) {
      _dio.options.headers['Authorization'] = 'Bearer $token';
    }
  }

  static Future<void> clearToken() async {
    _dio.options.headers.remove('Authorization');
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
  }
}
```

> The Laravel backend must return API tokens (Sanctum or session cookies) for this to work. If you are using session-based auth (default Breeze), keep the session cookie instead of a Bearer token.

---

## Part 6 — Set Up the Local Database

Create `lib/core/database/database_helper.dart`:

```dart
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class DatabaseHelper {
  static Database? _db;

  static Future<Database> get database async {
    _db ??= await _initDb();
    return _db!;
  }

  static Future<Database> _initDb() async {
    final path = join(await getDatabasesPath(), 'launchleaf.db');
    return openDatabase(path, version: 1, onCreate: _onCreate);
  }

  static Future<void> _onCreate(Database db, int version) async {
    await db.execute('''
      CREATE TABLE notes (
        id INTEGER PRIMARY KEY,
        title TEXT,
        body TEXT,
        updated_at TEXT,
        synced INTEGER DEFAULT 0
      )
    ''');

    await db.execute('''
      CREATE TABLE tasks (
        id INTEGER PRIMARY KEY,
        title TEXT,
        is_done INTEGER DEFAULT 0,
        position INTEGER DEFAULT 0,
        synced INTEGER DEFAULT 0
      )
    ''');

    // Add more tables for kanban, contacts, etc.
  }
}
```

---

## Part 7 — Create Data Models

Create `lib/models/note_model.dart`:

```dart
class NoteModel {
  final int? id;
  final String title;
  final String body;
  final String? updatedAt;

  const NoteModel({
    this.id,
    required this.title,
    required this.body,
    this.updatedAt,
  });

  factory NoteModel.fromJson(Map<String, dynamic> json) => NoteModel(
    id: json['id'] as int?,
    title: json['title'] as String,
    body: json['body'] as String? ?? '',
    updatedAt: json['updated_at'] as String?,
  );

  Map<String, dynamic> toJson() => {
    'title': title,
    'body': body,
  };

  NoteModel copyWith({int? id, String? title, String? body, String? updatedAt}) =>
      NoteModel(
        id: id ?? this.id,
        title: title ?? this.title,
        body: body ?? this.body,
        updatedAt: updatedAt ?? this.updatedAt,
      );
}
```

Repeat this pattern for `TaskModel`, `ContactModel`, and Kanban models.

---

## Part 8 — Create Providers (State Management)

Create `lib/providers/notes_provider.dart`:

```dart
import 'package:flutter/foundation.dart';
import '../core/api/api_client.dart';
import '../models/note_model.dart';

class NotesProvider extends ChangeNotifier {
  List<NoteModel> _notes = [];
  bool _isLoading = false;
  String? _error;

  List<NoteModel> get notes => _notes;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> fetchNotes() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final response = await ApiClient.instance.get('/api/notes');
      _notes = (response.data as List)
          .map((e) => NoteModel.fromJson(e as Map<String, dynamic>))
          .toList();
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> createNote(String title, String body) async {
    final response = await ApiClient.instance.post('/api/notes', data: {
      'title': title,
      'body': body,
    });
    _notes.insert(0, NoteModel.fromJson(response.data as Map<String, dynamic>));
    notifyListeners();
  }

  Future<void> deleteNote(int id) async {
    await ApiClient.instance.delete('/api/notes/$id');
    _notes.removeWhere((n) => n.id == id);
    notifyListeners();
  }
}
```

---

## Part 9 — Set Up Navigation

Create `lib/app_router.dart`:

```dart
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'providers/auth_provider.dart';
import 'screens/login_screen.dart';
import 'screens/dashboard_screen.dart';
import 'screens/notes/notes_screen.dart';
import 'screens/tasks/tasks_screen.dart';

GoRouter buildRouter() {
  return GoRouter(
    initialLocation: '/dashboard',
    redirect: (context, state) {
      final auth = context.read<AuthProvider>();
      final isLoggedIn = auth.isAuthenticated;
      final onLogin = state.matchedLocation == '/login';

      if (!isLoggedIn && !onLogin) return '/login';
      if (isLoggedIn && onLogin) return '/dashboard';
      return null;
    },
    routes: [
      GoRoute(path: '/login',     builder: (_, __) => const LoginScreen()),
      GoRoute(path: '/dashboard', builder: (_, __) => const DashboardScreen()),
      GoRoute(path: '/notes',     builder: (_, __) => const NotesScreen()),
      GoRoute(path: '/tasks',     builder: (_, __) => const TasksScreen()),
    ],
  );
}
```

---

## Part 10 — Write the Screens

### 10.1 Login screen

Create `lib/screens/login_screen.dart`:

```dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailCtrl = TextEditingController();
  final _passCtrl  = TextEditingController();
  bool _loading = false;

  Future<void> _login() async {
    setState(() => _loading = true);
    try {
      await context.read<AuthProvider>().login(
        _emailCtrl.text.trim(),
        _passCtrl.text,
      );
      if (mounted) context.go('/dashboard');
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString())),
        );
      }
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Card(
          margin: const EdgeInsets.all(32),
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text('LaunchLeaf', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                const SizedBox(height: 24),
                TextField(controller: _emailCtrl, decoration: const InputDecoration(labelText: 'Email')),
                const SizedBox(height: 12),
                TextField(controller: _passCtrl, decoration: const InputDecoration(labelText: 'Password'), obscureText: true),
                const SizedBox(height: 24),
                _loading
                    ? const CircularProgressIndicator()
                    : ElevatedButton(onPressed: _login, child: const Text('Login')),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
```

### 10.2 Notes screen (list + create)

Create `lib/screens/notes/notes_screen.dart`:

```dart
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/notes_provider.dart';

class NotesScreen extends StatefulWidget {
  const NotesScreen({super.key});

  @override
  State<NotesScreen> createState() => _NotesScreenState();
}

class _NotesScreenState extends State<NotesScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<NotesProvider>().fetchNotes();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Notes')),
      body: Consumer<NotesProvider>(
        builder: (context, provider, _) {
          if (provider.isLoading) return const Center(child: CircularProgressIndicator());
          if (provider.error != null) return Center(child: Text(provider.error!));
          if (provider.notes.isEmpty) return const Center(child: Text('No notes yet.'));

          return ListView.builder(
            itemCount: provider.notes.length,
            itemBuilder: (context, i) {
              final note = provider.notes[i];
              return ListTile(
                title: Text(note.title),
                subtitle: Text(note.body, maxLines: 1, overflow: TextOverflow.ellipsis),
                trailing: IconButton(
                  icon: const Icon(Icons.delete, color: Colors.red),
                  onPressed: () => provider.deleteNote(note.id!),
                ),
              );
            },
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _showCreateDialog,
        child: const Icon(Icons.add),
      ),
    );
  }

  void _showCreateDialog() {
    final titleCtrl = TextEditingController();
    final bodyCtrl  = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('New Note'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(controller: titleCtrl, decoration: const InputDecoration(labelText: 'Title')),
            TextField(controller: bodyCtrl,  decoration: const InputDecoration(labelText: 'Body'), maxLines: 4),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              context.read<NotesProvider>().createNote(titleCtrl.text, bodyCtrl.text);
              Navigator.pop(ctx);
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }
}
```

---

## Part 11 — Wire Up `main.dart`

```dart
import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:sqflite_common_ffi/sqflite_ffi.dart';

import 'app_router.dart';
import 'providers/auth_provider.dart';
import 'providers/notes_provider.dart';
import 'providers/tasks_provider.dart';
import 'providers/kanban_provider.dart';
import 'providers/contact_provider.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Windows and Linux need the FFI database factory
  if (!kIsWeb && (Platform.isWindows || Platform.isLinux)) {
    sqfliteFfiInit();
    databaseFactory = databaseFactoryFfi;
  }

  final authProvider = AuthProvider();
  await authProvider.checkAuthStatus(); // restore session from saved token

  runApp(LaunchLeafApp(authProvider: authProvider));
}

class LaunchLeafApp extends StatelessWidget {
  const LaunchLeafApp({super.key, required this.authProvider});

  final AuthProvider authProvider;

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider<AuthProvider>.value(value: authProvider),
        ChangeNotifierProvider(create: (_) => NotesProvider()),
        ChangeNotifierProvider(create: (_) => TasksProvider()),
        ChangeNotifierProvider(create: (_) => KanbanProvider()),
        ChangeNotifierProvider(create: (_) => ContactProvider()),
      ],
      child: Builder(
        builder: (context) => MaterialApp.router(
          title: 'LaunchLeaf',
          debugShowCheckedModeBanner: false,
          routerConfig: buildRouter(),
        ),
      ),
    );
  }
}
```

---

## Part 12 — Run the App

```bash
# List connected devices
flutter devices

# Run on a specific device
flutter run -d windows        # Windows desktop
flutter run -d emulator-5554  # Android emulator
flutter run                   # picks the only connected device
```

---

## Part 13 — Build a Release

### Android APK

```bash
flutter build apk --release
```

The APK file will be at `build/app/outputs/flutter-apk/app-release.apk`.

### Windows EXE

```bash
flutter build windows --release
```

The output is at `build/windows/x64/runner/Release/`.

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `flutter pub get` | Install dependencies |
| `flutter devices` | List connected devices |
| `flutter run` | Run the app in debug mode |
| `flutter build apk` | Build an Android APK |
| `flutter build windows` | Build a Windows executable |
| `flutter test` | Run all tests |
| `dart format .` | Format all Dart files |
| `dart analyze` | Run static analysis |
