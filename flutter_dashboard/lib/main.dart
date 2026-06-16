import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:sqflite_common_ffi/sqflite_ffi.dart';

import 'app_router.dart';
import 'core/constants/app_colors.dart';
import 'providers/auth_provider.dart';
import 'providers/contact_provider.dart';
import 'providers/dashboard_provider.dart';
import 'providers/kanban_provider.dart';
import 'providers/notes_provider.dart';
import 'providers/tasks_provider.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  if (!kIsWeb && (Platform.isWindows || Platform.isLinux)) {
    sqfliteFfiInit();
    databaseFactory = databaseFactoryFfi;
  }

  final authProvider = AuthProvider();
  await authProvider.checkAuthStatus();

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
        ChangeNotifierProvider(create: (_) => DashboardProvider()),
        ChangeNotifierProvider(create: (_) => NotesProvider()),
        ChangeNotifierProvider(create: (_) => TasksProvider()),
        ChangeNotifierProvider(create: (_) => ContactProvider()),
        ChangeNotifierProvider(create: (_) => KanbanProvider()),
      ],
      child: Builder(
        builder: (context) {
          final router = buildRouter();
          return MaterialApp.router(
            title: 'LaunchLeaf',
            theme: AppColors.theme,
            debugShowCheckedModeBanner: false,
            routerConfig: router,
          );
        },
      ),
    );
  }
}
