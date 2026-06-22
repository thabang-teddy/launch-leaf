<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ContactApiController;
use App\Http\Controllers\Api\DashboardApiController;
use App\Http\Controllers\Api\FlutterSyncController;
use App\Http\Controllers\Api\KanbanApiController;
use App\Http\Controllers\Api\NoteApiController;
use App\Http\Controllers\Api\TaskApiController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // Local-first sync — push pending changes to server
    Route::post('/sync/changes', [FlutterSyncController::class, 'sync']);

    Route::get('/dashboard', [DashboardApiController::class, 'index']);

    // Notes
    Route::get('/notes', [NoteApiController::class, 'index']);
    Route::post('/notes', [NoteApiController::class, 'store']);
    Route::put('/notes/{note}', [NoteApiController::class, 'update']);
    Route::delete('/notes/{note}', [NoteApiController::class, 'destroy']);

    // Tasks
    Route::get('/tasks', [TaskApiController::class, 'index']);
    Route::post('/tasks', [TaskApiController::class, 'store']);
    Route::put('/tasks/{task}', [TaskApiController::class, 'update']);
    Route::delete('/tasks/{task}', [TaskApiController::class, 'destroy']);
    Route::patch('/tasks/{task}/toggle', [TaskApiController::class, 'toggle']);

    // Contacts
    Route::get('/contacts', [ContactApiController::class, 'index']);
    Route::delete('/contacts/{contact}', [ContactApiController::class, 'destroy']);
    Route::post('/contacts/{contact}/reply', [ContactApiController::class, 'reply']);

    // Kanban
    Route::get('/kanban/full', [KanbanApiController::class, 'full']);

    Route::post('/kanban/boards', [KanbanApiController::class, 'storeBoard']);
    Route::put('/kanban/boards/{board}', [KanbanApiController::class, 'updateBoard']);
    Route::delete('/kanban/boards/{board}', [KanbanApiController::class, 'destroyBoard']);

    Route::post('/kanban/projects', [KanbanApiController::class, 'storeProject']);
    Route::put('/kanban/projects/{project}', [KanbanApiController::class, 'updateProject']);
    Route::delete('/kanban/projects/{project}', [KanbanApiController::class, 'destroyProject']);

    Route::post('/kanban/columns', [KanbanApiController::class, 'storeColumn']);
    Route::put('/kanban/columns/{column}', [KanbanApiController::class, 'updateColumn']);
    Route::delete('/kanban/columns/{column}', [KanbanApiController::class, 'destroyColumn']);

    Route::post('/kanban/cards', [KanbanApiController::class, 'storeCard']);
    Route::put('/kanban/cards/{card}', [KanbanApiController::class, 'updateCard']);
    Route::delete('/kanban/cards/{card}', [KanbanApiController::class, 'destroyCard']);
});
