<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\KanbanBoard;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KanbanBoardController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Dashboard/Kanban/Index', [
            'boards' => KanbanBoard::withCount('projects')
                ->orderBy('order')
                ->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Dashboard/Kanban/Boards/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'color'       => 'nullable|string|max:20',
        ]);

        $validated['order'] = (KanbanBoard::max('order') ?? -1) + 1;
        $validated['color'] ??= '#2DC9A2';

        $board = KanbanBoard::create($validated);

        return redirect()->route('dashboard.kanban.boards.show', $board)
            ->with('success', 'Board created.');
    }

    public function show(KanbanBoard $kanbanBoard): Response
    {
        return Inertia::render('Dashboard/Kanban/Boards/Show', [
            'board'    => $kanbanBoard,
            'projects' => $kanbanBoard->projects()
                ->withCount(['columns', 'cards'])
                ->get(),
        ]);
    }

    public function edit(KanbanBoard $kanbanBoard): Response
    {
        return Inertia::render('Dashboard/Kanban/Boards/Edit', [
            'board' => $kanbanBoard,
        ]);
    }

    public function update(Request $request, KanbanBoard $kanbanBoard): RedirectResponse
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'color'       => 'nullable|string|max:20',
        ]);

        $kanbanBoard->update($validated);

        return redirect()->route('dashboard.kanban.boards.show', $kanbanBoard)
            ->with('success', 'Board updated.');
    }

    public function destroy(KanbanBoard $kanbanBoard): RedirectResponse
    {
        // DB cascades: board → projects → columns → cards
        $kanbanBoard->delete();

        return redirect()->route('dashboard.kanban.index')
            ->with('success', 'Board and all its contents deleted.');
    }
}
