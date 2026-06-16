<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class TaskApiController extends Controller
{
    public function index(): JsonResponse
    {
        $tasks = Task::orderBy('is_completed')->orderBy('order')->get([
            'id', 'title', 'description', 'is_completed',
            'completed_at', 'due_date', 'order', 'created_at', 'updated_at',
        ]);

        return response()->json($tasks);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'       => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'due_date'    => ['nullable', 'date'],
        ]);

        $data['order'] = (Task::max('order') ?? 0) + 1;

        $task = Task::create($data);

        return response()->json($task, 201);
    }

    public function update(Request $request, Task $task): JsonResponse
    {
        $data = $request->validate([
            'title'       => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'due_date'    => ['nullable', 'date'],
        ]);

        $task->update($data);

        return response()->json($task);
    }

    public function destroy(Task $task): JsonResponse
    {
        $task->delete();

        return response()->json(null, 204);
    }

    public function toggle(Task $task): JsonResponse
    {
        $isNowComplete = ! $task->is_completed;

        $task->update([
            'is_completed' => $isNowComplete,
            'completed_at' => $isNowComplete ? Carbon::now() : null,
        ]);

        return response()->json($task);
    }
}
