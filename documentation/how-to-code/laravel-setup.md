# How to Recreate LaunchLeaf — Laravel Web App (Code Guide)

This guide walks a beginner through recreating the LaunchLeaf Laravel + React web app from scratch, step by step.

---

## What You Are Building

A personal portfolio website with two parts:
- **Public site** — visitors can read your portfolio, projects, experience, tips, and send you a message.
- **Dashboard** — password-protected admin panel where you manage all content.

**Tech you will use:** PHP, Laravel 10, React 18, Inertia.js, Bootstrap 5, SQLite.

---

## Part 1 — Install the Tools

Before writing any code, install these on your computer.

### 1.1 PHP (version 8.1 or newer)

Download from [https://www.php.net/downloads](https://www.php.net/downloads).

On Windows, use the "Thread Safe" ZIP. Unzip it, add the folder to your PATH, then open a terminal and verify:

```bash
php -v
```

You should see something like `PHP 8.1.x`.

### 1.2 Composer (PHP package manager)

Download the installer from [https://getcomposer.org/download](https://getcomposer.org/download) and run it.

Verify:

```bash
composer -V
```

### 1.3 Node.js and npm

Download from [https://nodejs.org](https://nodejs.org). Choose the LTS version.

Verify:

```bash
node -v
npm -v
```

### 1.4 Git

Download from [https://git-scm.com](https://git-scm.com).

---

## Part 2 — Create the Laravel Project

All terminal commands below are run from inside the `laravel/` folder unless stated otherwise.

### 2.1 Create a new Laravel app

```bash
composer create-project laravel/laravel launch-leaf
cd launch-leaf
```

### 2.2 Enable SQLite

Open the `.env` file (copy `.env.example` first if it doesn't exist) and change the database section:

```env
DB_CONNECTION=sqlite
# Delete or comment out DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD
```

Then create the database file:

```bash
touch database/database.sqlite
```

> On Windows use: `type nul > database\database.sqlite`

### 2.3 Generate the app key

```bash
php artisan key:generate
```

---

## Part 3 — Install Frontend Tools

### 3.1 Install Inertia.js (server side)

```bash
composer require inertiajs/inertia-laravel
```

Publish the middleware:

```bash
php artisan inertia:middleware
```

Then open `app/Http/Kernel.php` and add this line inside the `web` middleware group:

```php
\App\Http\Middleware\HandleInertiaRequests::class,
```

### 3.2 Install Inertia.js (client side) and React

```bash
npm install @inertiajs/react react react-dom
```

### 3.3 Install Bootstrap 5

```bash
npm install bootstrap
```

### 3.4 Set up Vite

Open `vite.config.js` and update it to handle React:

```js
import { defineConfig } from 'vite'
import laravel from 'laravel-vite-plugin'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    laravel({ input: ['resources/js/app.jsx'], refresh: true }),
    react(),
  ],
})
```

Install the React plugin:

```bash
npm install @vitejs/plugin-react
```

### 3.5 Set up the main JS entry point

Create `resources/js/app.jsx`:

```jsx
import '../css/app.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import { createRoot } from 'react-dom/client'
import { createInertiaApp } from '@inertiajs/react'
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers'

createInertiaApp({
  resolve: name =>
    resolvePageComponent(
      `./Pages/${name}.jsx`,
      import.meta.glob('./Pages/**/*.jsx'),
    ),
  setup({ el, App, props }) {
    createRoot(el).render(<App {...props} />)
  },
})
```

Update `resources/views/app.blade.php` (the main Blade template) to include Vite:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    @viteReactRefresh
    @vite(['resources/js/app.jsx'])
    @inertiaHead
  </head>
  <body>
    @inertia
  </body>
</html>
```

---

## Part 4 — Set Up Authentication

### 4.1 Install Laravel Breeze with Inertia + React

```bash
composer require laravel/breeze --dev
php artisan breeze:install react
npm install
npm run dev
php artisan migrate
```

This gives you login, logout, email verification, and a `/dashboard` redirect out of the box.

---

## Part 5 — Build the Database

### 5.1 Create migrations for each section

Run one command per content type:

```bash
php artisan make:migration create_portfolio_items_table
php artisan make:migration create_experiences_table
php artisan make:migration create_tips_table
php artisan make:migration create_github_projects_table
php artisan make:migration create_other_accounts_table
php artisan make:migration create_personal_infos_table
php artisan make:migration create_contacts_table
php artisan make:migration create_notes_table
php artisan make:migration create_tasks_table
php artisan make:migration create_kanban_boards_table
php artisan make:migration create_kanban_projects_table
php artisan make:migration create_kanban_columns_table
php artisan make:migration create_kanban_cards_table
```

Open each migration file in `database/migrations/` and define the columns. Example for portfolio items:

```php
public function up(): void
{
    Schema::create('portfolio_items', function (Blueprint $table) {
        $table->id();
        $table->string('title');
        $table->string('slug')->unique();
        $table->text('description')->nullable();
        $table->string('image_url')->nullable();
        $table->string('project_url')->nullable();
        $table->timestamps();
    });
}
```

Run all migrations:

```bash
php artisan migrate
```

### 5.2 Create Eloquent models

```bash
php artisan make:model PortfolioItem
php artisan make:model Experience
php artisan make:model Tip
php artisan make:model GitHubProject
php artisan make:model OtherAccount
php artisan make:model PersonalInfo
php artisan make:model Contact
php artisan make:model Note
php artisan make:model Task
php artisan make:model KanbanBoard
php artisan make:model KanbanProject
php artisan make:model KanbanColumn
php artisan make:model KanbanCard
```

---

## Part 6 — Build the Controllers

### 6.1 Folder structure

```
app/Http/Controllers/
├── Frontend/     ← read-only public pages
└── Dashboard/    ← auth-protected CRUD
```

Create the folders:

```bash
mkdir app/Http/Controllers/Frontend
mkdir app/Http/Controllers/Dashboard
```

### 6.2 Create a public controller

Example for the portfolio public listing:

```bash
php artisan make:controller Frontend/PortfolioController
```

Open the file and add:

```php
namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\PortfolioItem;
use Inertia\Inertia;

class PortfolioController extends Controller
{
    public function index()
    {
        return Inertia::render('Frontend/Portfolio/Index', [
            'items' => PortfolioItem::latest()->get(),
        ]);
    }

    public function show(string $slug)
    {
        $item = PortfolioItem::where('slug', $slug)->firstOrFail();
        return Inertia::render('Frontend/Portfolio/Show', ['item' => $item]);
    }
}
```

### 6.3 Create a dashboard controller

```bash
php artisan make:controller Dashboard/PortfolioController --resource
```

The `--resource` flag creates all CRUD methods at once (index, create, store, show, edit, update, destroy).

---

## Part 7 — Add Routes

Open `routes/web.php` and register your routes:

```php
use App\Http\Controllers\Frontend\PortfolioController;
use App\Http\Controllers\Dashboard\PortfolioController as DashPortfolioController;

// Public
Route::get('/portfolio',        [PortfolioController::class, 'index'])->name('portfolio.index');
Route::get('/portfolio/{slug}', [PortfolioController::class, 'show'])->name('portfolio.show');

// Dashboard (auth-protected)
Route::middleware(['auth', 'verified'])->prefix('dashboard')->name('dashboard.')->group(function () {
    Route::resource('portfolio', DashPortfolioController::class);
});
```

Repeat this pattern for each content section.

---

## Part 8 — Build the React Pages

### 8.1 Create the layouts

Create `resources/js/Layouts/FrontendLayout.jsx`:

```jsx
export default function FrontendLayout({ children }) {
  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        {/* navigation links */}
      </nav>
      <main>{children}</main>
      <footer className="bg-dark text-white py-4">
        {/* footer content */}
      </footer>
    </div>
  )
}
```

Create `resources/js/Layouts/DashboardLayout.jsx` similarly with a sidebar.

### 8.2 Create a public page

Create `resources/js/Pages/Frontend/Portfolio/Index.jsx`:

```jsx
import FrontendLayout from '@/Layouts/FrontendLayout'
import { Link } from '@inertiajs/react'

export default function Index({ items }) {
  return (
    <FrontendLayout>
      <div className="container py-5">
        <h1>Portfolio</h1>
        <div className="row">
          {items.map(item => (
            <div key={item.id} className="col-md-4 mb-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">{item.title}</h5>
                  <Link href={`/portfolio/${item.slug}`} className="btn btn-primary">
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </FrontendLayout>
  )
}
```

### 8.3 Create a dashboard CRUD page

Create `resources/js/Pages/Dashboard/Portfolio/Index.jsx`:

```jsx
import DashboardLayout from '@/Layouts/DashboardLayout'
import { Link, router } from '@inertiajs/react'

export default function Index({ items }) {
  function destroy(id) {
    if (confirm('Delete this item?')) {
      router.delete(`/dashboard/portfolio/${id}`)
    }
  }

  return (
    <DashboardLayout>
      <div className="container py-4">
        <div className="d-flex justify-content-between mb-3">
          <h2>Portfolio</h2>
          <Link href="/dashboard/portfolio/create" className="btn btn-primary">
            Add New
          </Link>
        </div>
        <table className="table">
          <thead>
            <tr><th>Title</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td>{item.title}</td>
                <td>
                  <Link href={`/dashboard/portfolio/${item.id}/edit`} className="btn btn-sm btn-secondary me-2">Edit</Link>
                  <button onClick={() => destroy(item.id)} className="btn btn-sm btn-danger">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  )
}
```

---

## Part 9 — GitHub API Integration

### 9.1 Add your GitHub token to `.env`

```env
GITHUB_TOKEN=your_personal_access_token_here
```

### 9.2 Create the GitHub service

Create `app/Services/GitHubService.php`:

```php
namespace App\Services;

use Illuminate\Support\Facades\Http;

class GitHubService
{
    public function sync($model): void
    {
        $token = config('services.github.token');
        // Extract owner and repo from the github_url stored on the model
        preg_match('#github\.com/([^/]+)/([^/]+)#', $model->github_url, $m);
        [$owner, $repo] = [$m[1], rtrim($m[2], '.git')];

        $headers = ['Authorization' => "Bearer {$token}", 'Accept' => 'application/vnd.github+json'];

        $readme = Http::withHeaders($headers)
            ->get("https://api.github.com/repos/{$owner}/{$repo}/readme")
            ->json();

        $tree = Http::withHeaders($headers)
            ->get("https://api.github.com/repos/{$owner}/{$repo}/git/trees/HEAD?recursive=1")
            ->json();

        $model->update([
            'readme_content' => isset($readme['content'])
                ? base64_decode($readme['content'])
                : null,
            'file_tree'  => $tree['tree'] ?? [],
            'synced_at'  => now(),
        ]);
    }
}
```

Add the token to `config/services.php`:

```php
'github' => [
    'token' => env('GITHUB_TOKEN'),
],
```

---

## Part 10 — Contact Form with Email

### 10.1 Add a contact migration

The `contacts` table needs: `name`, `email`, `message`, `replied_at`.

### 10.2 Create a Mailable

```bash
php artisan make:mail ContactReply
```

Edit `app/Mail/ContactReply.php` to build the reply email.

### 10.3 Controller store action

```php
public function store(Request $request)
{
    $data = $request->validate([
        'name'    => 'required|string|max:100',
        'email'   => 'required|email',
        'message' => 'required|string|max:2000',
    ]);

    Contact::create($data);

    return back()->with('success', 'Message sent!');
}
```

---

## Part 11 — Run the App

```bash
# In one terminal
composer run serve

# In another terminal
npm run dev
```

Open your browser at `http://127.0.0.1:8000`.

---

## Part 12 — Production Build

```bash
npm run build
php artisan optimize
```

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `php artisan make:model Foo` | Create a model |
| `php artisan make:migration create_foos_table` | Create a migration |
| `php artisan make:controller Bar/FooController --resource` | Create a resource controller |
| `php artisan migrate` | Run pending migrations |
| `php artisan migrate:rollback` | Undo the last migration batch |
| `php artisan tinker` | Interactive PHP console |
| `php artisan route:list` | List all registered routes |
| `php artisan test` | Run the test suite |
