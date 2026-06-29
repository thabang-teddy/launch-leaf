# How to Recreate LaunchLeaf — Laravel Web App (AI Prompt Guide)

This guide shows you exactly what to say to an AI assistant (like Claude) to recreate the LaunchLeaf Laravel web app without writing code from scratch yourself. Each prompt is a ready-to-use instruction. Copy it, paste it into Claude Code or any AI chat, and the AI will do the work.

---

## How to Use This Guide

1. Open Claude Code in your terminal (`claude`) or go to [claude.ai](https://claude.ai).
2. Copy a prompt block below.
3. Paste it and press Enter.
4. Read what the AI produces, then move on to the next step.

You do not need to understand every line of code the AI writes — but do **read the output** so you know what was created.

---

## Step 1 — Project Setup

### 1.1 Create the project and install everything

```
I want to build a personal portfolio website using Laravel 10, React 18, Inertia.js, and Bootstrap 5. The database should be SQLite. Please:
1. Give me the exact terminal commands to create a new Laravel project.
2. Install Inertia.js on the server side and show me how to register its middleware.
3. Install React and Bootstrap 5 with npm.
4. Set up Vite to work with React and Inertia.
5. Show me the final contents of vite.config.js and the main resources/js/app.jsx entry file.
```

### 1.2 Set up authentication

```
I have a new Laravel 10 project. I want to add password-protected login using Laravel Breeze with the Inertia.js + React option. Please give me:
1. The composer and artisan commands to install and scaffold Breeze.
2. The command to run the database migrations.
3. An explanation of what files Breeze creates so I know where the login page lives.
```

---

## Step 2 — Database Design

### 2.1 Create all migrations

```
I am building a portfolio website in Laravel with SQLite. I need database tables for the following sections. Please write a separate Laravel migration file for each one:

1. portfolio_items — title, slug (unique), description (nullable), image_url (nullable), project_url (nullable), timestamps
2. experiences — title, slug (unique), company, role, start_date, end_date (nullable), description (nullable), timestamps
3. tips — title, slug (unique), body (text), timestamps
4. github_projects — title, slug (unique), github_url, readme_content (longText, nullable), file_tree (JSON, nullable), synced_at (nullable), timestamps
5. other_accounts — same columns as github_projects
6. personal_infos — name, title, bio (text, nullable), email, phone (nullable), location (nullable), avatar_url (nullable), cv_url (nullable), timestamps
7. contacts — name, email, subject (nullable), message (text), replied_at (nullable), timestamps
8. notes — title, body (text), timestamps
9. tasks — title, is_done (boolean default false), position (integer default 0), timestamps
10. kanban_boards — name, timestamps
11. kanban_projects — kanban_board_id (foreign key), name, timestamps
12. kanban_columns — kanban_project_id (foreign key), name, position, timestamps
13. kanban_cards — kanban_column_id (foreign key), title, description (nullable), position, timestamps

Show me all the migration files.
```

### 2.2 Create the Eloquent models

```
Based on the migrations I just created (portfolio_items, experiences, tips, github_projects, other_accounts, personal_infos, contacts, notes, tasks, kanban_boards, kanban_projects, kanban_columns, kanban_cards), please create all the Laravel Eloquent model files with:
- Correct $fillable arrays
- Any belongsTo and hasMany relationships
- A getRouteKeyName() returning 'slug' for models that have a slug column
```

---

## Step 3 — Controllers

### 3.1 Public read-only controllers

```
I am building a Laravel + Inertia.js portfolio site. Public visitors should be able to browse all content but not edit anything.

Please create Frontend (public, read-only) controllers in app/Http/Controllers/Frontend/ for each section below. Each controller should extend Controller, use Inertia::render(), and pass the relevant model data as props. Use the slug column for show() routes.

Sections: Portfolio, Experience, Tips, GitHubProjects (use GitHubProject model), OtherAccounts, PersonalInfo (single record — use ::first()), Contact (index shows form, store saves and validates)

Show me all the controller files.
```

### 3.2 Dashboard CRUD controllers

```
I need auth-protected CRUD controllers in app/Http/Controllers/Dashboard/ for my Laravel admin dashboard. Each controller should use Inertia::render() and redirect()->route() after store/update/destroy.

Please create resource controllers for: Portfolio, Experience, Tips, GitHubProjects, OtherAccounts, Note, Task, PersonalInfo (no index/create/destroy — just edit and update), Contact (index, show, reply via email, destroy)

Also create a KanbanBoardController, KanbanProjectController, KanbanColumnController, and KanbanCardController with standard CRUD plus a reorder() action that accepts an ordered array of IDs.

Show me all the files.
```

### 3.3 GitHub sync controller

```
I have a GitHubProject and OtherAccount model in my Laravel app. Each has a github_url, readme_content, file_tree (JSON), and synced_at column.

Please create:
1. app/Services/GitHubService.php — a service class with a sync($model) method that:
   - Reads GITHUB_TOKEN from config
   - Parses the owner and repo name from github_url
   - Calls the GitHub REST API v3 to fetch the README and file tree
   - Saves the results back to the model and updates synced_at
2. app/Http/Controllers/Dashboard/GitHubSyncController.php — with syncProject($project) and syncAccount($account) methods that call GitHubService::sync()

Show me both files.
```

---

## Step 4 — Routes

### 4.1 Register all routes

```
I have a Laravel 10 app with Frontend and Dashboard controller namespaces. Please write the complete routes/web.php file that:

Public routes (no middleware):
- / → Frontend\HomeController@index
- /portfolio and /portfolio/{slug} → Frontend\PortfolioController
- /experience and /experience/{slug} → Frontend\ExperienceController
- /projects and /projects/{slug} → Frontend\ProjectController
- /accounts and /accounts/{slug} → Frontend\AccountController
- /tips and /tips/{slug} → Frontend\TipController
- /about → Frontend\PersonalInfoController@index
- /contact GET and POST → Frontend\ContactController

Dashboard routes (middleware: auth, verified, prefix: dashboard):
- Resource routes for: projects, accounts, portfolio, experience, tips, notes, tasks, pages, skills
- POST projects/{project}/sync and accounts/{account}/sync → GitHubSyncController
- Kanban: boards resource, projects resource, columns resource (with reorder), cards resource (with reorder)
- GET/PATCH user → UserController
- GET/PUT personal-info → PersonalInfoController
- GET/POST/DELETE contact routes → ContactController

Show me the complete web.php file with all use statements at the top.
```

---

## Step 5 — React Pages

### 5.1 Create the layouts

```
I am building a Laravel + React + Inertia.js + Bootstrap 5 portfolio website. Please create two layout components:

1. resources/js/Layouts/FrontendLayout.jsx
   - A responsive Bootstrap navbar with links to: Home, Portfolio, Projects, Experience, Tips, About, Contact
   - A <main> content area that renders {children}
   - A footer with my name and the current year

2. resources/js/Layouts/DashboardLayout.jsx
   - A sidebar on the left with navigation links to all dashboard sections (Projects, Portfolio, Experience, Tips, Notes, Tasks, Kanban, Contact, Personal Info)
   - A top header bar with the app name and a Logout button (uses Inertia's router.post('/logout'))
   - A main content area that renders {children}
   - This layout should use Inertia's persistent layout feature (assign Layout as a static property on each page)

Show me both files.
```

### 5.2 Create a public listing page

```
I need a React page for the public portfolio listing in my Laravel + Inertia.js app.

File: resources/js/Pages/Frontend/Portfolio/Index.jsx

Props it receives from the controller: items (array of portfolio objects with id, title, slug, description, image_url)

Please create the component using FrontendLayout and Bootstrap 5 card grid. Each card should show the image (if present), title, description excerpt, and a "View" link to /portfolio/{slug} using Inertia's <Link> component.

Show me the file.
```

### 5.3 Create a dashboard CRUD set

```
I need a full CRUD set of React pages for managing portfolio items in my Laravel + Inertia.js admin dashboard. The pages live under resources/js/Pages/Dashboard/Portfolio/.

Please create all four pages using DashboardLayout and Bootstrap 5:

1. Index.jsx — table listing all items with Edit and Delete buttons. Delete uses router.delete() with a confirm dialog.
2. Create.jsx — form with fields: title, description (textarea), image_url, project_url. Uses Inertia useForm hook, posts to /dashboard/portfolio.
3. Edit.jsx — same form pre-filled with existing data, sends PUT request.
4. Show.jsx — read-only detail view.

All forms should show server-side validation errors inline under each field.

Show me all four files.
```

---

## Step 6 — Contact Form and Email

### 6.1 Contact form with email reply

```
I have a Contact model in Laravel with columns: name, email, subject, message, replied_at.

Please create:
1. Frontend\ContactController — index() renders the form, store() validates and saves the contact
2. A Mailable at app/Mail/ContactReply.php that takes a Contact model and a reply message string
3. Dashboard\ContactController — index() lists contacts, show() shows one, reply() sends the email and sets replied_at, destroy() deletes it
4. The React page resources/js/Pages/Frontend/Contact/Index.jsx — a Bootstrap contact form with name, email, subject, message fields and a success flash message

Show me all the files.
```

---

## Step 7 — Kanban Board

### 7.1 Kanban drag-and-drop board page

```
I have a Kanban system in Laravel with these models: KanbanBoard, KanbanProject, KanbanColumn, KanbanCard. Each has a position column for ordering.

Please create the React page resources/js/Pages/Dashboard/Kanban/Show.jsx that:
- Receives a kanbanProject with its columns, each column with its cards, as Inertia props
- Renders columns side by side using Bootstrap d-flex
- Each column shows its cards stacked vertically
- Has an "Add Card" button per column that opens a small inline form
- Has a "Delete" button on each card
- Sends reorder requests to /dashboard/kanban/cards/reorder via router.post() when cards are moved (you can skip actual drag-and-drop and use Up/Down arrow buttons instead to keep it simple)

Show me the file.
```

---

## Step 8 — Testing

### 8.1 Generate basic tests

```
I have a Laravel portfolio app. Please write PHPUnit feature tests for the following:

1. Public portfolio listing returns 200 and contains portfolio items
2. Dashboard portfolio index redirects guests to /login
3. Authenticated user can create a portfolio item via POST /dashboard/portfolio
4. Authenticated user can delete a portfolio item
5. Contact form POST validates required fields and returns errors
6. Contact form POST with valid data creates a Contact record

Use Laravel's RefreshDatabase trait and the actingAs() helper for auth tests.

Show me a single test file at tests/Feature/PortfolioTest.php.
```

---

## Step 9 — Deployment Checklist

### 9.1 Prepare for production

```
My Laravel 10 portfolio site is ready for deployment. Please give me:
1. The exact artisan and npm commands to build for production
2. What environment variables I must set on the server (.env)
3. How to point a web server (Apache or Nginx) at the laravel/public/ folder
4. The php artisan commands I should run after uploading files (optimize, migrate, etc.)
5. A checklist of things to verify before going live (HTTPS, APP_DEBUG=false, GITHUB_TOKEN, mail config)
```

---

## Useful Follow-Up Prompts

Use these any time you get stuck:

```
The command I ran gave this error: [paste error here]. I am on Windows and my project is a Laravel 10 app. What is the fix?
```

```
I ran php artisan migrate and got: [paste error]. What does this mean and how do I fix it?
```

```
My React page is showing a blank screen. Here is the browser console error: [paste error]. The page component is at resources/js/Pages/Frontend/Portfolio/Index.jsx. What is wrong?
```

```
I need to add a new section called "Certifications" to my portfolio site. It should work exactly like the Tips section. Give me:
1. The migration
2. The model
3. The Frontend controller
4. The Dashboard controller
5. The routes
6. The Index and Create React pages
```
