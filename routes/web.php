<?php

use Illuminate\Support\Facades\Route;

// ─── Frontend (public) controllers ───────────────────────────────────────────
use App\Http\Controllers\Frontend\HomeController;
use App\Http\Controllers\Frontend\ProjectController;
use App\Http\Controllers\Frontend\AccountController;
use App\Http\Controllers\Frontend\PortfolioController;
use App\Http\Controllers\Frontend\ExperienceController;
use App\Http\Controllers\Frontend\PersonalInfoController;
use App\Http\Controllers\Frontend\TipController;
use App\Http\Controllers\Frontend\ContactController;

// ─── Dashboard controllers ────────────────────────────────────────────────────
use App\Http\Controllers\Dashboard\PageController;
use App\Http\Controllers\Dashboard\NoteController;
use App\Http\Controllers\Dashboard\KanbanColumnController;
use App\Http\Controllers\Dashboard\KanbanCardController;
use App\Http\Controllers\Dashboard\TaskController;
use App\Http\Controllers\Dashboard\ProjectController        as DashProjectController;
use App\Http\Controllers\Dashboard\AccountController       as DashAccountController;
use App\Http\Controllers\Dashboard\PortfolioController     as DashPortfolioController;
use App\Http\Controllers\Dashboard\ExperienceController    as DashExperienceController;
use App\Http\Controllers\Dashboard\PersonalInfoController  as DashPersonalInfoController;
use App\Http\Controllers\Dashboard\TipController           as DashTipController;
use App\Http\Controllers\Dashboard\ContactController       as DashContactController;
use App\Http\Controllers\Dashboard\GitHubSyncController;

// ─────────────────────────────────────────────────────────────────────────────
// Public frontend routes
// ─────────────────────────────────────────────────────────────────────────────

Route::get('/', [HomeController::class, 'index'])->name('home');

Route::get('/projects',        [ProjectController::class, 'index'])->name('projects.index');
Route::get('/projects/{slug}', [ProjectController::class, 'show'])->name('projects.show');

Route::get('/accounts',        [AccountController::class, 'index'])->name('accounts.index');
Route::get('/accounts/{slug}', [AccountController::class, 'show'])->name('accounts.show');

Route::get('/portfolio',        [PortfolioController::class, 'index'])->name('portfolio.index');
Route::get('/portfolio/{slug}', [PortfolioController::class, 'show'])->name('portfolio.show');

Route::get('/experience',        [ExperienceController::class, 'index'])->name('experience.index');
Route::get('/experience/{slug}', [ExperienceController::class, 'show'])->name('experience.show');

Route::get('/cv', [PersonalInfoController::class, 'index'])->name('cv');

Route::get('/tips',        [TipController::class, 'index'])->name('tips.index');
Route::get('/tips/{slug}', [TipController::class, 'show'])->name('tips.show');

Route::get('/contact',  [ContactController::class, 'index'])->name('contact');
Route::post('/contact', [ContactController::class, 'store'])->name('contact.store');

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard (auth-protected)
// ─────────────────────────────────────────────────────────────────────────────

Route::middleware(['auth', 'verified'])->prefix('dashboard')->name('dashboard.')->group(function () {

    Route::get('/', fn () => inertia('Dashboard/Home'))->name('home');

    // GitHub Projects — CRUD + sync
    Route::resource('projects',   DashProjectController::class);
    Route::post('projects/{project}/sync', [GitHubSyncController::class, 'syncProject'])
        ->name('projects.sync');

    // Other Accounts — CRUD + sync
    Route::resource('accounts',   DashAccountController::class);
    Route::post('accounts/{account}/sync', [GitHubSyncController::class, 'syncAccount'])
        ->name('accounts.sync');

    // Content CRUD
    Route::resource('portfolio',  DashPortfolioController::class);
    Route::resource('experience', DashExperienceController::class);
    Route::resource('tips',       DashTipController::class);
    Route::resource('pages',      PageController::class);
    Route::resource('notes',      NoteController::class);

    // Kanban
    Route::resource('kanban/columns', KanbanColumnController::class)->names([
        'index'   => 'kanban.columns.index',
        'create'  => 'kanban.columns.create',
        'store'   => 'kanban.columns.store',
        'show'    => 'kanban.columns.show',
        'edit'    => 'kanban.columns.edit',
        'update'  => 'kanban.columns.update',
        'destroy' => 'kanban.columns.destroy',
    ]);
    Route::resource('kanban/cards', KanbanCardController::class)->names([
        'index'   => 'kanban.cards.index',
        'create'  => 'kanban.cards.create',
        'store'   => 'kanban.cards.store',
        'show'    => 'kanban.cards.show',
        'edit'    => 'kanban.cards.edit',
        'update'  => 'kanban.cards.update',
        'destroy' => 'kanban.cards.destroy',
    ]);
    Route::get('kanban', fn () => inertia('Dashboard/Kanban/Index'))->name('kanban.index');

    // Tasks
    Route::resource('tasks', TaskController::class);

    // Personal Info — single-record edit/update (no index/create/show/delete)
    Route::get('personal-info',         [DashPersonalInfoController::class, 'edit'])->name('personal-info');
    Route::put('personal-info',         [DashPersonalInfoController::class, 'update'])->name('personal-info.update');

    // Contact messages
    Route::get('contact',               [DashContactController::class, 'index'])->name('contact.index');
    Route::get('contact/{contact}',     [DashContactController::class, 'show'])->name('contact.show');
    Route::post('contact/{contact}/reply', [DashContactController::class, 'reply'])->name('contact.reply');
    Route::delete('contact/{contact}',  [DashContactController::class, 'destroy'])->name('contact.destroy');
});

// Keep Breeze's profile routes and auth routes
Route::middleware('auth')->group(function () {
    Route::get('/profile', [\App\Http\Controllers\ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [\App\Http\Controllers\ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [\App\Http\Controllers\ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Redirect root /dashboard to named route
Route::get('/dashboard', fn () => redirect()->route('dashboard.home'))
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

require __DIR__ . '/auth.php';
