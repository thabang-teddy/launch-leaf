# How to Recreate LaunchLeaf — Flutter App (AI Prompt Guide)

This guide gives you ready-to-use prompts you can paste into an AI assistant (like Claude) to recreate the LaunchLeaf Flutter companion app step by step. No deep Dart knowledge required — just follow each prompt in order.

---

## How to Use This Guide

1. Open Claude Code in your terminal (`claude`) or go to [claude.ai](https://claude.ai).
2. Copy a prompt block below.
3. Paste it and press Enter.
4. The AI writes the code for you. Read the output, apply the files, then move to the next step.

---

## Step 1 — Project Setup

### 1.1 Create the project and add dependencies

```
I want to build a Flutter mobile and desktop companion app that connects to a Laravel backend API. The app will run on Android and Windows.

Please:
1. Give me the flutter create command to start the project.
2. Show me the complete pubspec.yaml with these packages:
   - go_router (navigation)
   - provider (state management)
   - dio (HTTP requests)
   - sqflite and sqflite_common_ffi (local SQLite database — sqflite_common_ffi is needed for Windows)
   - shared_preferences (saving the login token)
   - intl (date formatting)
3. Explain briefly what each package does.
```

### 1.2 Plan the folder structure

```
I am building a Flutter app called LaunchLeaf that has login, dashboard, notes, tasks, kanban, and contact screens. It uses Provider for state management and Go Router for navigation.

Please give me the recommended folder structure inside lib/ with a one-line explanation of what each folder is for. I want:
- core/ (api, constants, database, utils)
- models/
- providers/
- screens/ (each feature in its own subfolder)
- shared/widgets/
```

---

## Step 2 — HTTP Client and URL Configuration

### 2.1 Create the Dio API client

```
I am building a Flutter app that talks to a Laravel backend running on my development PC.

Please create lib/core/api/api_client.dart with a Dio singleton that:
- On Android emulator, uses base URL http://10.0.2.2:8000 (the emulator's alias for the PC's localhost)
- On Windows desktop, uses http://127.0.0.1:8000
- Sets Accept: application/json and X-Requested-With: XMLHttpRequest headers
- Has a connectTimeout of 10 seconds and receiveTimeout of 30 seconds
- Has static methods: setAuthToken(token), loadSavedToken(), and clearToken() that read and write from SharedPreferences

Also create lib/core/utils/url_resolver.dart that contains a resolveBaseUrl() function using Platform and kIsWeb to pick the right URL.

Show me both files.
```

### 2.2 Create the auth service

```
I have a Dio API client in my Flutter app. The backend is Laravel with session-based auth (no Bearer tokens — it uses Laravel Sanctum cookies or a /api/login endpoint that returns a token).

Please create lib/core/api/auth_service.dart with:
- A login(email, password) method that POSTs to /api/login and saves the returned token
- A logout() method that POSTs to /api/logout and clears the saved token
- A checkAuth() method that calls /api/user to verify the session is still valid

Show me the file.
```

---

## Step 3 — Local Database

### 3.1 Set up SQLite for offline storage

```
I am building a Flutter app that caches data locally in SQLite so it works offline.

Please create lib/core/database/database_helper.dart with:
- A static getter that returns a singleton Database
- An _onCreate method that creates tables for:
  - notes: id (primary key), title (text), body (text), updated_at (text), synced (integer default 0)
  - tasks: id (primary key), title (text), is_done (integer default 0), position (integer default 0), synced (integer default 0)
  - sync_changes: id (primary key), entity_type (text), entity_id (integer), action (text: create/update/delete), payload (text JSON), created_at (text)
- Helper methods: insertNote(), updateNote(), deleteNote(), getAllNotes(), insertTask(), updateTask(), deleteTask(), getAllTasks()

The database file should be named launchleaf.db.

Show me the complete file.
```

---

## Step 4 — Data Models

### 4.1 Create all models

```
I am building a Flutter app connected to a Laravel portfolio backend. Please create Dart model classes for each of the following. Each model should have:
- A const constructor with all required fields
- A factory NoteModel.fromJson(Map<String, dynamic> json) method
- A toJson() method
- A copyWith() method

Models to create:
1. lib/models/note_model.dart — fields: id (int?), title, body, updatedAt
2. lib/models/task_model.dart — fields: id (int?), title, isDone (bool), position (int)
3. lib/models/contact_model.dart — fields: id (int?), name, email, subject (nullable), message, repliedAt (nullable)
4. lib/models/kanban_models.dart — three classes: KanbanColumn (id, name, position, cards), KanbanCard (id, title, description?, position, columnId)

Show me all the files.
```

---

## Step 5 — State Management (Providers)

### 5.1 Auth provider

```
I am building a Flutter app with Provider state management. Please create lib/providers/auth_provider.dart that:
- Extends ChangeNotifier
- Tracks isAuthenticated (bool) and currentUser (nullable map)
- Has a login(email, password) method that calls AuthService and sets isAuthenticated to true
- Has a logout() method that clears auth state
- Has a checkAuthStatus() method called at app startup to restore a saved session

Show me the file.
```

### 5.2 Notes provider

```
I need lib/providers/notes_provider.dart for my Flutter app. Please create it with:
- A private _notes list, _isLoading bool, and _error nullable string
- Public getters for each
- fetchNotes() — calls GET /api/notes via Dio, maps response to NoteModel list
- createNote(title, body) — calls POST /api/notes, inserts result at top of list
- updateNote(id, title, body) — calls PUT /api/notes/{id}, replaces item in list
- deleteNote(id) — calls DELETE /api/notes/{id}, removes from list
- All methods call notifyListeners() after changing state

Show me the file.
```

### 5.3 Tasks provider

```
I need lib/providers/tasks_provider.dart for my Flutter app. Please create it with the same structure as NotesProvider but for tasks:
- fetchTasks() — GET /api/tasks
- createTask(title) — POST /api/tasks
- toggleTask(id, isDone) — PATCH /api/tasks/{id}
- deleteTask(id) — DELETE /api/tasks/{id}
- reorderTask(id, newPosition) — POST /api/tasks/reorder

Show me the file.
```

### 5.4 Kanban provider

```
I need lib/providers/kanban_provider.dart for my Flutter app. It manages kanban boards.

Please create it with:
- fetchBoards() — GET /api/kanban/boards, returns list of boards
- fetchProject(projectId) — GET /api/kanban/projects/{id}, returns project with columns and cards
- createCard(columnId, title) — POST /api/kanban/cards
- moveCard(cardId, newColumnId, newPosition) — POST /api/kanban/cards/reorder
- deleteCard(cardId) — DELETE /api/kanban/cards/{id}

Show me the file.
```

---

## Step 6 — Navigation

### 6.1 Set up Go Router

```
I am building a Flutter app with go_router. Please create lib/app_router.dart that:

- Creates a GoRouter with a redirect that sends unauthenticated users to /login
- The redirect reads from AuthProvider using context.read<AuthProvider>()
- Routes:
  - /login → LoginScreen
  - /dashboard → DashboardScreen
  - /notes → NotesScreen
  - /notes/:id → NoteEditorScreen (receives id as path param)
  - /tasks → TasksScreen
  - /kanban → KanbanScreen (list of boards)
  - /kanban/:id → KanbanBoardScreen (specific board)
  - /contact → ContactScreen
  - /contact/:id → ContactDetailScreen

Export a buildRouter() function that returns the router.

Show me the complete file.
```

---

## Step 7 — Screens

### 7.1 Login screen

```
I need lib/screens/login_screen.dart for my Flutter app. Please create a login screen that:
- Has a centered card (max width 400) with an email TextField, a password TextField (obscured), and a Login button
- Shows a CircularProgressIndicator while logging in
- On success calls context.go('/dashboard') using go_router
- On error shows a SnackBar with the error message
- Uses context.read<AuthProvider>().login(email, password)
- Has a show/hide password toggle button inside the password field

Show me the file.
```

### 7.2 Dashboard overview screen

```
I need lib/screens/dashboard_screen.dart for my Flutter app. Please create a dashboard home screen that:
- Shows a grid of stat cards (notes count, tasks count, open contacts count, kanban boards count)
- Each card is tappable and navigates to the relevant screen using context.go()
- Has a Scaffold with a sidebar drawer (AppDrawer widget from lib/shared/widgets/app_drawer.dart)
- The AppBar has the app name and a logout button
- Fetches counts from each provider using Consumer widgets

Show me the file and the AppDrawer widget.
```

### 7.3 Notes screen

```
I need lib/screens/notes/notes_screen.dart for my Flutter app. Please create:

1. NotesScreen — a Scaffold with:
   - AppBar titled "Notes"
   - A ListView.builder that shows each note as a ListTile (title + body excerpt)
   - Pull-to-refresh using RefreshIndicator
   - A FloatingActionButton that opens a bottom sheet to create a new note
   - Swipe-to-delete using Dismissible
   - Loading and error states

2. NoteEditorScreen at lib/screens/notes/note_editor_screen.dart — opens when tapping a note, allows editing the title and body and saving via PUT

Show me both files.
```

### 7.4 Tasks screen

```
I need lib/screens/tasks/tasks_screen.dart for my Flutter app. Please create a tasks screen that:
- Shows tasks as CheckboxListTile widgets
- Checking/unchecking a task calls provider.toggleTask(id, !isDone)
- Has a text field at the top or a FAB to add a new task
- Shows a strike-through on completed task titles
- Shows an empty state message when there are no tasks
- Uses Consumer<TasksProvider> for reactive rebuilds

Show me the file.
```

### 7.5 Kanban board screen

```
I need lib/screens/kanban/kanban_board_screen.dart for my Flutter app. Please create a kanban board screen that:
- Receives a board ID via GoRouter path parameter
- Fetches the board's columns and cards from KanbanProvider
- Renders columns in a horizontal scrollable row using SingleChildScrollView + Row
- Each column is a fixed-width card (~280px) with a vertical list of task cards
- Has an "Add Card" button at the bottom of each column
- Tapping a card shows a dialog to view/delete it
- Shows a loading spinner while fetching

Show me the file.
```

### 7.6 Contact screen

```
I need lib/screens/contact/contact_screen.dart for my Flutter app. Please create:

1. ContactScreen — a ListView of received contact messages with sender name, subject, and date. Tapping a message navigates to ContactDetailScreen.

2. ContactDetailScreen at lib/screens/contact/contact_detail_screen.dart — shows the full message. Has a "Reply by Email" button that opens a dialog with a text area, then sends the reply via POST /api/contact/{id}/reply.

Show me both files.
```

---

## Step 8 — Shared Widgets

### 8.1 Reusable widgets

```
I am building a Flutter app and need some reusable shared widgets. Please create:

1. lib/shared/widgets/app_drawer.dart — a side drawer with navigation links to Dashboard, Notes, Tasks, Kanban, Contact, and a Logout option at the bottom

2. lib/shared/widgets/ll_app_bar.dart — a custom AppBar widget that takes a title string and an optional list of action buttons

3. lib/shared/widgets/ll_stat_card.dart — a card widget that takes a label (String), a count (int), an icon (IconData), a color, and an onTap callback. Displays the icon and count in a coloured box.

Show me all three files.
```

---

## Step 9 — Sync and Offline Support

### 9.1 Background sync service

```
I am building a Flutter app that needs to sync local SQLite data with a Laravel backend. Please create lib/core/api/sync_service.dart that:

- Has a syncAll() method that:
  1. Fetches notes from GET /api/notes and upserts them into the local SQLite notes table
  2. Fetches tasks from GET /api/tasks and upserts them into the local SQLite tasks table
  3. Updates a last_synced_at value in SharedPreferences

- Has a pushPendingChanges() method that reads from the sync_changes table and POSTs/PUTs/DELETEs each pending change to the API, then removes the record from the table

- Handles Dio errors gracefully — if the API is unreachable, the method exits silently so offline mode still works

Show me the file.
```

---

## Step 10 — Theming

### 10.1 App colours and theme

```
I am building a Flutter app called LaunchLeaf. Please create lib/core/constants/app_colors.dart that defines:
- A primary green colour: Color(0xFF4CAF50)
- Secondary and surface colours
- A static ThemeData get theme that uses these colours with:
  - ColorScheme.fromSeed with the primary green
  - A dark AppBar
  - Slightly rounded card shapes
  - Clean input decoration with outlined borders

Show me the file.
```

---

## Step 11 — Building for Release

### 11.1 Build prompts

```
My Flutter LaunchLeaf app is ready to release. Please give me:
1. The flutter build command to create a release APK for Android
2. The flutter build command to create a Windows executable
3. Where the output files are located after building
4. What to check in AndroidManifest.xml before releasing (permissions, exported flag)
5. How to enable obfuscation in the APK build for security
```

---

## Useful Follow-Up Prompts

Use these any time you are stuck:

```
I got this Flutter error when running the app: [paste error]. The file involved is lib/screens/notes/notes_screen.dart. What is wrong and how do I fix it?
```

```
My Dio request to http://10.0.2.2:8000/api/notes is failing with "Connection refused" on the Android emulator. My Laravel server is running on my PC. What should I check?
```

```
I want to add a "Portfolio" section to my Flutter app that shows the portfolio items fetched from GET /api/portfolio. Give me:
1. The PortfolioModel class
2. The PortfolioProvider
3. The PortfolioScreen (a grid of cards)
4. The route in app_router.dart
```

```
My Flutter app shows the login screen even though I am already logged in. The token is saved in SharedPreferences. How do I fix the auth redirect logic in Go Router?
```

```
I want to add pull-to-refresh to my NotesScreen. Show me how to wrap the ListView with RefreshIndicator and call provider.fetchNotes() when the user pulls down.
```
