<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Task;
use App\Traits\ResolvesOrder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
    use ResolvesOrder;

    public function index(): Response
    {
        return Inertia::render('Dashboard/Tasks/Index', [
            'tasks' => Task::orderBy('is_completed')->orderBy('order')->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Dashboard/Tasks/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date'    => 'nullable|date',
            'order'       => 'nullable|integer|min:1',
        ]);

        $validated['order'] = $this->nextAvailableOrder(Task::class, $validated['order'] ?? 1);

        Task::create($validated);

        return redirect()->route('dashboard.tasks.index')->with('success', 'Task created.');
    }

    public function show(Task $task): RedirectResponse
    {
        return redirect()->route('dashboard.tasks.edit', $task);
    }

    public function edit(Task $task): Response
    {
        return Inertia::render('Dashboard/Tasks/Edit', ['task' => $task]);
    }

    public function update(Request $request, Task $task): RedirectResponse
    {
        $validated = $request->validate([
            'title'        => 'required|string|max:255',
            'description'  => 'nullable|string',
            'due_date'     => 'nullable|date',
            'is_completed' => 'boolean',
            'order'        => 'nullable|integer|min:1',
        ]);

        if (!empty($validated['is_completed']) && !$task->is_completed) {
            $validated['completed_at'] = now();
        } elseif (isset($validated['is_completed']) && !$validated['is_completed']) {
            $validated['completed_at'] = null;
        }

        if (isset($validated['order'])) {
            $validated['order'] = $this->nextAvailableOrder(Task::class, $validated['order'], $task->id);
        }

        $task->update($validated);

        return back()->with('success', 'Task updated.');
    }

    public function destroy(Task $task): RedirectResponse
    {
        $task->delete();

        return redirect()->route('dashboard.tasks.index')->with('success', 'Task deleted.');
    }
}
