# LaunchLeaf

A personal portfolio and admin dashboard built with Laravel, React, and Inertia.js. The public site showcases portfolio work, GitHub projects, experience, tips, and a contact form. The password-protected dashboard provides full content management and personal productivity tools.

## Features

### Public Portfolio
- **Projects** — GitHub-synced project listings with README and file tree display
- **Portfolio** — Showcase of selected work with detail pages
- **Experience** — Work history with rich descriptions
- **Tips** — Knowledge base of problems and solutions
- **CV** — Personal profile and contact information
- **Contact** — Message form with email notification and reply support

### Admin Dashboard
- **Content Management** — Full CRUD for all portfolio sections
- **GitHub Sync** — Trigger re-fetch of GitHub project data and READMEs
- **Kanban Board** — Project board with columns and cards
- **Task Manager** — Checklist-based task tracking
- **Notes** — Freeform personal notes
- **Inbox** — View received contact messages and send email replies

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Laravel 10 |
| Frontend | React 18 + Inertia.js |
| Styling | Bootstrap 5 |
| Database | SQLite |
| Auth | Laravel Breeze (session-based) |
| GitHub Data | GitHub REST API v3 (proxied + cached) |
| Build Tool | Vite |

## Getting Started

### Prerequisites

- PHP 8.1+
- Composer
- Node.js 18+ and npm
- A GitHub personal access token

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/launch-leaf.git
cd launch-leaf

# Install dependencies
composer install
npm install

# Configure environment
cp .env.example .env
php artisan key:generate

# Set up the database
touch database/database.sqlite
php artisan migrate
```

### Environment Variables

Copy `.env.example` to `.env` and fill in the following:

```env
GITHUB_TOKEN=            # GitHub personal access token (required for project sync)

MAIL_MAILER=smtp
MAIL_HOST=
MAIL_PORT=
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM_ADDRESS=
```

### Running Locally

Run both servers concurrently in separate terminals:

```bash
# Laravel dev server
composer run serve       # http://127.0.0.1:8000

# Vite HMR
npm run dev
```

### Production Build

```bash
npm run build
php artisan optimize
```

## Project Structure

```
launch-leaf/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Dashboard/        # Auth-protected CRUD controllers
│   │   │   └── Frontend/         # Public read-only controllers
│   │   └── Middleware/
│   ├── Models/                   # Eloquent models
│   ├── Services/
│   │   └── GitHubService.php     # GitHub API proxy + DB cache
│   └── Mail/                     # Mailables for contact replies
├── database/
│   ├── migrations/
│   └── database.sqlite
├── resources/
│   └── js/
│       ├── Pages/
│       │   ├── Frontend/         # Public React pages
│       │   └── Dashboard/        # Admin React pages
│       ├── Components/           # Shared React components
│       └── Layouts/
│           ├── FrontendLayout.jsx
│           └── DashboardLayout.jsx
├── routes/
│   ├── web.php                   # All Inertia routes
│   └── auth.php
└── vite.config.js
```

## Routes

### Public

| Route | Page |
|-------|------|
| `/` | Home |
| `/projects` | GitHub Projects listing |
| `/projects/{slug}` | Project detail (README + file tree) |
| `/portfolio` | Portfolio listing |
| `/portfolio/{slug}` | Portfolio detail |
| `/experience` | Experience listing |
| `/experience/{slug}` | Experience detail |
| `/cv` | Personal info / CV |
| `/tips` | Tips listing |
| `/tips/{slug}` | Tip detail |
| `/contact` | Contact form |

### Dashboard (requires authentication)

| Section | Path |
|---------|------|
| GitHub Projects | `/dashboard/projects` |
| Portfolio | `/dashboard/portfolio` |
| Experience | `/dashboard/experience` |
| Tips | `/dashboard/tips` |
| Personal Info | `/dashboard/personal-info` |
| Contact Inbox | `/dashboard/contact` |
| Kanban | `/dashboard/kanban` |
| Tasks | `/dashboard/tasks` |
| Notes | `/dashboard/notes` |

## Testing

```bash
php artisan test
php artisan test --filter=GitHubServiceTest
```

## License

This project is for personal use. All rights reserved.
