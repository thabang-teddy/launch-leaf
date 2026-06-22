import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';

import 'providers/auth_provider.dart';
import 'screens/contact/contact_detail_screen.dart';
import 'screens/contact/contact_screen.dart';
import 'screens/dashboard_screen.dart';
import 'screens/kanban/kanban_board_screen.dart';
import 'screens/kanban/kanban_screen.dart';
import 'screens/login_screen.dart';
import 'screens/notes/note_editor_screen.dart';
import 'screens/notes/notes_screen.dart';
import 'screens/tasks/task_editor_screen.dart';
import 'screens/tasks/tasks_screen.dart';
import 'shell_screen.dart';

GoRouter buildRouter() {
  return GoRouter(
    initialLocation: '/dashboard',
    redirect: (context, state) async {
      final auth = context.read<AuthProvider>();
      final isLoggedIn = auth.isLoggedIn;
      final isLoginRoute = state.matchedLocation == '/login';

      if (!isLoggedIn && !isLoginRoute) return '/login';
      if (isLoggedIn && isLoginRoute) return '/dashboard';
      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      ShellRoute(
        builder: (context, state, child) => ShellScreen(child: child),
        routes: [
          GoRoute(
            path: '/dashboard',
            builder: (context, state) => const DashboardScreen(),
          ),
          GoRoute(
            path: '/notes',
            builder: (context, state) => const NotesScreen(),
            routes: [
              GoRoute(
                path: 'new',
                builder: (context, state) => const NoteEditorScreen(),
              ),
              GoRoute(
                path: ':id',
                builder: (context, state) {
                  final idStr = state.pathParameters['id'] ?? '';
                  final id = int.tryParse(idStr);
                  return NoteEditorScreen(noteId: id);
                },
              ),
            ],
          ),
          GoRoute(
            path: '/tasks',
            builder: (context, state) => const TasksScreen(),
            routes: [
              GoRoute(
                path: 'new',
                builder: (context, state) => const TaskEditorScreen(),
              ),
              GoRoute(
                path: ':id',
                builder: (context, state) {
                  final idStr = state.pathParameters['id'] ?? '';
                  final id = int.tryParse(idStr);
                  return TaskEditorScreen(taskId: id);
                },
              ),
            ],
          ),
          GoRoute(
            path: '/contact',
            builder: (context, state) => const ContactScreen(),
            routes: [
              GoRoute(
                path: ':id',
                builder: (context, state) {
                  final idStr = state.pathParameters['id'] ?? '';
                  final id = int.tryParse(idStr) ?? 0;
                  return ContactDetailScreen(contactId: id);
                },
              ),
            ],
          ),
          GoRoute(
            path: '/kanban',
            builder: (context, state) => const KanbanScreen(),
            routes: [
              GoRoute(
                path: 'board/:id',
                builder: (context, state) {
                  final idStr = state.pathParameters['id'] ?? '';
                  final id = int.tryParse(idStr) ?? 0;
                  return KanbanBoardScreen(projectId: id);
                },
              ),
            ],
          ),
        ],
      ),
    ],
  );
}
