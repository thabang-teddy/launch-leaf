# LaunchLeaf

Personal portfolio + admin dashboard. The public site exposes portfolio, GitHub projects, experience, tips, and a contact form. The password-protected dashboard manages all content and provides personal productivity tools (Kanban, tasks, notes).

## Tech Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Backend | Laravel 10 | Routing, Eloquent ORM, Mail |
| Frontend | React 18 + Inertia.js | Server-driven SPA — no separate JSON API |
| CSS | Bootstrap 5 | via npm |
| DB | SQLite | `laravel/database/database.sqlite` |
| Auth | Laravel Breeze (session-based) | Dashboard only; public site is unauthenticated |
| GitHub data | GitHub REST API v3 | Proxied through Laravel, results persisted in DB |
| Build | Vite | `laravel/vite.config.js` |

## Project Structure

```
launch-leaf/                      # Git root
├── .claude/                      # Claude project config
├── CLAUDE.md
└── laravel/                      # Laravel project root (run all commands from here)
    ├── app/
    │   ├── Http/
    │   │   ├── Controllers/
    │   │   │   ├── Dashboard/    # Auth-protected CRUD controllers
    │   │   │   └── Frontend/     # Public read-only controllers
    │   │   └── Middleware/
    │   ├── Models/               # Eloquent models
    │   ├── Services/
    │   │   └── GitHubService.php # GitHub API proxy + DB cache
    │   └── Mail/                 # Mailables (contact replies)
    ├── database/
    │   ├── migrations/
    │   └── database.sqlite
    ├── resources/
    │   └── js/
    │       ├── Pages/
    │       │   ├── Frontend/     # Public React pages
    │       │   └── Dashboard/    # Admin React pages
    │       ├── Components/       # Shared React components
    │       └── Layouts/
    │           ├── FrontendLayout.jsx
    │           └── DashboardLayout.jsx
    ├── routes/
    │   ├── web.php               # All Inertia routes
    │   └── auth.php
    └── vite.config.js
```

## Frontend Routes (public)

| URL | Page | Notes |
|-----|------|-------|
| `/` | Home | |
| `/projects` | GitHub Projects listing | |
| `/projects/{slug}` | Project detail | Shows README + file tree from cached GitHub data |
| `/accounts` | Other accounts listing | |
| `/accounts/{slug}` | Account detail | Shows README + file tree |
| `/portfolio` | Portfolio listing | |
| `/portfolio/{slug}` | Portfolio detail | |
| `/experience` | Experience listing | |
| `/experience/{slug}` | Experience detail | |
| `/cv` | Personal info / CV | Single-record page |
| `/tips` | Tips listing | |
| `/tips/{slug}` | Tip detail | |
| `/contact` | Contact form | Saves to DB, notifies via email |

## Dashboard Routes (auth-protected `/dashboard/*`)

| Section | Features |
|---------|----------|
| Pages | Custom page CRUD |
| Notes | Freeform notes |
| Kanban | Project board (columns + cards) |
| Tasks | Checklist items |
| GitHub Projects | CRUD + GitHub sync (trigger re-fetch) |
| Other Accounts | CRUD + GitHub sync |
| Portfolio | CRUD |
| Experience | CRUD |
| Personal Info | Single-record edit |
| Tips | CRUD (write about problems + solutions) |
| Contact | View received messages + send email reply |

## Build & Dev Commands

All commands must be run from the `laravel/` subdirectory.

```bash
cd laravel

# Install
composer install
npm install

# First-time setup
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate

# Dev (run both concurrently)
composer run serve       # Laravel on http://127.0.0.1:8000
npm run dev              # Vite HMR

# Production build
npm run build
php artisan optimize

# Tests
php artisan test
php artisan test --filter=GitHubServiceTest
```

## Required Environment Variables

```
GITHUB_TOKEN=            # Personal access token — needed for GitHub proxy
MAIL_MAILER=smtp
MAIL_HOST=
MAIL_PORT=
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM_ADDRESS=
```

## Additional Documentation

Read these when working in the relevant area:

| File | When to read |
|------|--------------|
| [.claude/docs/architectural_patterns.md](.claude/docs/architectural_patterns.md) | Before adding controllers, services, new pages, or the GitHub sync feature |
