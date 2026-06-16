import 'package:flutter/foundation.dart';

import '../core/database/database_helper.dart';
import '../models/kanban_models.dart';

class KanbanProvider extends ChangeNotifier {
  List<KanbanBoard> _boards = [];
  KanbanBoard? _selectedBoard;
  List<KanbanProject> _projects = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<KanbanBoard> get boards => _boards;
  KanbanBoard? get selectedBoard => _selectedBoard;
  List<KanbanProject> get projects => _projects;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  int get boardCount => _boards.length;

  Future<void> loadBoards() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _boards = await DatabaseHelper.instance.getBoards();
      if (_boards.isNotEmpty) {
        await selectBoard(_boards.first);
      } else {
        _selectedBoard = null;
        _projects = [];
      }
    } on Exception catch (e) {
      _errorMessage = 'Failed to load boards: ${e.toString()}';
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<void> selectBoard(KanbanBoard board) async {
    _selectedBoard = board;
    _isLoading = true;
    notifyListeners();

    try {
      final rawProjects = await DatabaseHelper.instance.getProjectsByBoard(board.id);
      final projects = <KanbanProject>[];
      for (final project in rawProjects) {
        final rawColumns = await DatabaseHelper.instance.getColumnsByProject(project.id);
        final columns = <KanbanColumn>[];
        for (final column in rawColumns) {
          final cards = await DatabaseHelper.instance.getCardsByColumn(column.id);
          columns.add(column.copyWith(cards: cards));
        }
        projects.add(project.copyWith(columns: columns));
      }
      _projects = projects;
    } on Exception catch (e) {
      _errorMessage = 'Failed to load board projects: ${e.toString()}';
    }

    _isLoading = false;
    notifyListeners();
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}
