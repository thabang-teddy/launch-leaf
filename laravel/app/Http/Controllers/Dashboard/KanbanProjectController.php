<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\KanbanProject;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KanbanProjectController extends Controller
{
    public function index(): RedirectResponse
    {
        return redirect()->route('dashboard.kanban.index');
    }

    public function create(Request $request): Response
    {
        return Inertia::render('Dashboard/Kanban/Projects/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'color'       => 'nullable|string|max:20',
        ]);

        $board = \App\Models\KanbanBoard::firstOrCreate(
            ['name' => 'Default'],
            ['color' => '#2DC9A2', 'order' => 0],
        );

        $validated['kanban_board_id'] = $board->id;
        $validated['order'] = (KanbanProject::where('kanban_board_id', $board->id)->max('order') ?? -1) + 1;
        $validated['color'] ??= '#2DC9A2';

        KanbanProject::create($validated);

        return redirect()
            ->route('dashboard.kanban.index')
            ->with('success', 'Project created.');
    }

    public function show(KanbanProject $kanbanProject): Response
    {
        return Inertia::render('Dashboard/Kanban/Board', [
            'project' => $kanbanProject->load('board'),
            'columns' => $kanbanProject->columns()
                ->with(['cards' => fn ($q) => $q->orderBy('order')])
                ->get(),
        ]);
    }

    public function edit(KanbanProject $kanbanProject): Response
    {
        return Inertia::render('Dashboard/Kanban/Projects/Edit', [
            'project' => $kanbanProject,
            'board'   => $kanbanProject->board,
        ]);
    }

    public function update(Request $request, KanbanProject $kanbanProject): RedirectResponse
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'color'       => 'nullable|string|max:20',
        ]);

        $kanbanProject->update($validated);

        return redirect()
            ->route('dashboard.kanban.projects.show', $kanbanProject)
            ->with('success', 'Project updated.');
    }

    public function destroy(KanbanProject $kanbanProject): RedirectResponse
    {
        // DB cascades: project → columns → cards
        $kanbanProject->delete();

        return redirect()
            ->route('dashboard.kanban.index')
            ->with('success', 'Project and all its columns and cards deleted.');
    }
}
