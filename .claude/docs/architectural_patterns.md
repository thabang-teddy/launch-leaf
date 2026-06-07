# Architectural Patterns

Patterns that recur across LaunchLeaf. Follow these when adding new features so the codebase stays consistent.

---

## 1. Inertia.js Page Routing

Laravel routes drive navigation. There is no client-side router config — every URL is a Laravel route that returns an Inertia response pointing to a React page component.

**Convention:**

```
Laravel route  →  Inertia::render('Frontend/Tips/Index')
                              ↑ maps to resources/js/Pages/Frontend/Tips/Index.jsx
```

- Public routes live in `routes/web.php` under no middleware.
- Dashboard routes live in `routes/web.php` under the `auth` + `verified` middleware group.
- The React component path passed to `Inertia::render()` is the directory path under `resources/js/Pages/`, using `/` as separator, without the `.jsx` extension.

**Props:** Data is passed as the second argument to `Inertia::render()`. React pages receive it as component props. Never fetch data inside React components on first load — pass everything from the controller.

---

## 2. Controller Namespacing (Frontend vs Dashboard)

Controllers are split into two namespaces that mirror the two concerns of the app.

```
app/Http/Controllers/
├── Frontend/           # Read-only, unauthenticated
│   ├── HomeController.php
│   ├── ProjectController.php
│   └── ...
└── Dashboard/          # Auth-protected, full CRUD
    ├── ProjectController.php
    └── ...
```

- `Frontend` controllers only read from the DB and call `Inertia::render()`.
- `Dashboard` controllers handle store/update/destroy and redirect with Inertia back or to index.
- When a model has both a public listing and a dashboard CRUD, there are **two controllers** with the same name in different namespaces. This is intentional — keep them separate rather than adding `if (auth()->check())` branches.

---

## 3. GitHub Proxy + DB Cache Pattern

GitHub data (contribution chart, README, file tree) is never fetched directly by the browser. The flow is:

```
Dashboard (trigger sync)
    → GitHubService::sync($model)
        → GitHub REST API v3
        → Persist raw data to DB columns (readme_content, file_tree JSON, etc.)
        → Update synced_at timestamp

Frontend detail page
    → Controller reads cached columns from DB
    → Passes to Inertia as props
    → React renders from props (no client-side GitHub calls)
```

**`GitHubService`** (`app/Services/GitHubService.php`) is the single place that calls the GitHub API. It receives a model (e.g., `GitHubProject`) and updates its cached columns. The `GITHUB_TOKEN` env var is read only here.

Models that use this pattern have:
- `github_url` — the repo URL entered in the dashboard
- `readme_content` — cached README markdown
- `file_tree` — cached JSON array of the repo file listing
- `synced_at` — timestamp of last sync

Sync is triggered manually from the dashboard (a "Sync" button that calls a dedicated `SyncController` action), not on every save.

---

## 4. Service Layer for External Integrations

Any call to a third-party system (GitHub API, Mail) is encapsulated in a service class under `app/Services/`. Controllers do not call `Http::get()` or `Mail::send()` directly.

```
app/Services/
├── GitHubService.php     # GitHub API calls + cache writes
└── ContactMailService.php  # Wraps reply Mailable dispatch
```

Controllers resolve services via constructor injection. Services are not registered in a service provider unless they need interface binding — plain class injection via Laravel's container is enough.

---

## 5. Single-Record Model Pattern

Some sections have exactly one record per app instance (Personal Info). These models:

- Have a migration with a single seeded row (id = 1).
- Use `PersonalInfo::first()` — never `find($id)` or route model binding.
- The dashboard edit page is a form that always updates the existing record (`PUT /dashboard/personal-info`), never creates one.
- There is no index or destroy action for these controllers.

---

## 6. Auth Flow

- Laravel Breeze scaffolded with the Inertia + React stack.
- Session-based auth (cookies). No API tokens or Sanctum.
- All dashboard routes are wrapped in `middleware(['auth', 'verified'])` in `routes/web.php`.
- The login page is the only auth page — no registration exposed publicly (the owner is the only user).
- After login, redirect to `/dashboard`.

---

## 7. Form Handling (Inertia useForm)

Dashboard forms use Inertia's `useForm` hook — not Axios or fetch directly.

```jsx
const { data, setData, post, put, processing, errors } = useForm({ title: '' })
```

- `post()` / `put()` / `delete()` map to the corresponding Laravel route.
- Server-side validation errors are returned via `$request->validate()` and surface in `errors` automatically.
- No manual error state management in React.

---

## 8. Layout Structure

Two persistent layouts wrap all pages:

| Layout | Used by | Contains |
|--------|---------|---------|
| `FrontendLayout.jsx` | All `Frontend/` pages | Public navbar, footer |
| `DashboardLayout.jsx` | All `Dashboard/` pages | Sidebar nav, auth guard |

Layouts are applied via Inertia's persistent layout feature (assign `Layout` as a static property on the page component), not by wrapping each page manually.
