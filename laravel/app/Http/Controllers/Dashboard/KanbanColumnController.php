<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\KanbanColumn;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KanbanColumnController extends Controller
{
    public function index(): RedirectResponse
    {
        return redirect()->route('dashboard.kanban.index');
    }

    public function reorder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items'         => 'required|array',
            'items.*.id'    => 'required|uuid|exists:kanban_columns,id',
            'items.*.order' => 'required|integer|min:0',
        ]);

        foreach ($validated['items'] as $item) {
            KanbanColumn::where('id', $item['id'])->update(['order' => $item['order']]);
        }

        return response()->json(['ok' => true]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('Dashboard/Kanban/ColumnCreate', [
            'project_id' => $request->query('project_id'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'kanban_project_id' => 'required|exists:kanban_projects,id',
            'title'             => 'required|string|max:255',
            'color'             => 'nullable|string|max:50',
            'order'             => 'nullable|integer|min:0',
        ]);

        $validated['order'] ??= (
            KanbanColumn::where('kanban_project_id', $validated['kanban_project_id'])->max('order') ?? -1
        ) + 1;

        KanbanColumn::create($validated);

        return redirect()
            ->route('dashboard.kanban.projects.show', $validated['kanban_project_id'])
            ->with('success', 'Column created.');
    }

    public function show(KanbanColumn $kanbanColumn): RedirectResponse
    {
        return redirect()->route('dashboard.kanban.columns.edit', $kanbanColumn);
    }

    public function edit(KanbanColumn $kanbanColumn): Response
    {
        return Inertia::render('Dashboard/Kanban/ColumnEdit', [
            'column'     => $kanbanColumn,
            'project_id' => $kanbanColumn->kanban_project_id,
        ]);
    }

    public function update(Request $request, KanbanColumn $kanbanColumn): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'color' => 'nullable|string|max:50',
            'order' => 'nullable|integer|min:0',
        ]);

        $kanbanColumn->update($validated);

        return redirect()
            ->route('dashboard.kanban.projects.show', $kanbanColumn->kanban_project_id)
            ->with('success', 'Column updated.');
    }

    public function destroy(KanbanColumn $kanbanColumn): RedirectResponse
    {
        $projectId = $kanbanColumn->kanban_project_id;
        $kanbanColumn->delete();

        return redirect()
            ->route('dashboard.kanban.projects.show', $projectId)
            ->with('success', 'Column deleted.');
    }
}
