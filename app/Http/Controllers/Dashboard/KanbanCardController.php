<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\KanbanCard;
use App\Models\KanbanColumn;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class KanbanCardController extends Controller
{
    public function index(): RedirectResponse
    {
        return redirect()->route('dashboard.kanban.index');
    }

    public function reorder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items'                    => 'required|array',
            'items.*.id'               => 'required|uuid|exists:kanban_cards,id',
            'items.*.kanban_column_id' => 'required|uuid|exists:kanban_columns,id',
            'items.*.order'            => 'required|integer|min:0',
        ]);

        foreach ($validated['items'] as $item) {
            KanbanCard::where('id', $item['id'])->update([
                'kanban_column_id' => $item['kanban_column_id'],
                'order'            => $item['order'],
            ]);
        }

        return response()->json(['ok' => true]);
    }

    public function create(Request $request): Response
    {
        $projectId = $request->query('project_id');

        $columns = $projectId
            ? KanbanColumn::where('kanban_project_id', $projectId)->orderBy('order')->get(['id', 'title'])
            : KanbanColumn::orderBy('order')->get(['id', 'title']);

        return Inertia::render('Dashboard/Kanban/CardCreate', [
            'columns'    => $columns,
            'project_id' => $projectId,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'kanban_column_id' => 'required|exists:kanban_columns,id',
            'title'            => 'required|string|max:255',
            'description'      => 'nullable|string',
            'due_date'         => 'nullable|date',
            'order'            => 'nullable|integer|min:0',
        ]);

        $validated['order'] ??= (
            KanbanCard::where('kanban_column_id', $validated['kanban_column_id'])->max('order') ?? -1
        ) + 1;

        KanbanCard::create($validated);

        $projectId = KanbanColumn::find($validated['kanban_column_id'])?->kanban_project_id;

        return redirect()
            ->route('dashboard.kanban.projects.show', $projectId)
            ->with('success', 'Card created.');
    }

    public function show(KanbanCard $kanbanCard): RedirectResponse
    {
        return redirect()->route('dashboard.kanban.cards.edit', $kanbanCard);
    }

    public function edit(KanbanCard $kanbanCard): Response
    {
        $kanbanCard->load('column');
        $projectId = $kanbanCard->column->kanban_project_id;

        return Inertia::render('Dashboard/Kanban/CardEdit', [
            'card'       => $kanbanCard,
            'columns'    => KanbanColumn::where('kanban_project_id', $projectId)
                ->orderBy('order')
                ->get(['id', 'title']),
            'project_id' => $projectId,
        ]);
    }

    public function update(Request $request, KanbanCard $kanbanCard): RedirectResponse
    {
        $validated = $request->validate([
            'kanban_column_id' => 'required|exists:kanban_columns,id',
            'title'            => 'required|string|max:255',
            'description'      => 'nullable|string',
            'due_date'         => 'nullable|date',
            'order'            => 'nullable|integer|min:0',
        ]);

        $kanbanCard->update($validated);

        $projectId = KanbanColumn::find($validated['kanban_column_id'])?->kanban_project_id;

        return redirect()
            ->route('dashboard.kanban.projects.show', $projectId)
            ->with('success', 'Card updated.');
    }

    public function destroy(KanbanCard $kanbanCard): RedirectResponse
    {
        $kanbanCard->load('column');
        $projectId = $kanbanCard->column->kanban_project_id;
        $kanbanCard->delete();

        return redirect()
            ->route('dashboard.kanban.projects.show', $projectId)
            ->with('success', 'Card deleted.');
    }
}
