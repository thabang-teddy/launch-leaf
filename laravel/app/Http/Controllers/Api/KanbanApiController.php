<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\KanbanBoard;
use App\Models\KanbanCard;
use App\Models\KanbanColumn;
use App\Models\KanbanProject;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class KanbanApiController extends Controller
{
    public function full(): JsonResponse
    {
        $boards = KanbanBoard::with([
            'projects' => function ($q) {
                $q->orderBy('order')->with([
                    'columns' => function ($q) {
                        $q->orderBy('order')->with([
                            'cards' => fn ($q) => $q->orderBy('order'),
                        ]);
                    },
                ]);
            },
        ])->orderBy('order')->get();

        return response()->json($boards);
    }

    // --- Boards ---

    public function storeBoard(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'color'       => ['nullable', 'string', 'max:50'],
            'order'       => ['nullable', 'integer'],
        ]);

        $board = KanbanBoard::create($data);

        return response()->json($board, 201);
    }

    public function updateBoard(Request $request, KanbanBoard $board): JsonResponse
    {
        $data = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'color'       => ['nullable', 'string', 'max:50'],
            'order'       => ['nullable', 'integer'],
        ]);

        $board->update($data);

        return response()->json($board);
    }

    public function destroyBoard(KanbanBoard $board): JsonResponse
    {
        $board->delete();

        return response()->json(null, 204);
    }

    // --- Projects ---

    public function storeProject(Request $request): JsonResponse
    {
        $data = $request->validate([
            'kanban_board_id' => ['required', 'string', 'exists:kanban_boards,id'],
            'name'            => ['required', 'string', 'max:255'],
            'description'     => ['nullable', 'string'],
            'color'           => ['nullable', 'string', 'max:50'],
            'order'           => ['nullable', 'integer'],
        ]);

        $project = KanbanProject::create($data);

        return response()->json($project, 201);
    }

    public function updateProject(Request $request, KanbanProject $project): JsonResponse
    {
        $data = $request->validate([
            'kanban_board_id' => ['required', 'string', 'exists:kanban_boards,id'],
            'name'            => ['required', 'string', 'max:255'],
            'description'     => ['nullable', 'string'],
            'color'           => ['nullable', 'string', 'max:50'],
            'order'           => ['nullable', 'integer'],
        ]);

        $project->update($data);

        return response()->json($project);
    }

    public function destroyProject(KanbanProject $project): JsonResponse
    {
        $project->delete();

        return response()->json(null, 204);
    }

    // --- Columns ---

    public function storeColumn(Request $request): JsonResponse
    {
        $data = $request->validate([
            'kanban_project_id' => ['required', 'string', 'exists:kanban_projects,id'],
            'title'             => ['required', 'string', 'max:255'],
            'color'             => ['nullable', 'string', 'max:50'],
            'order'             => ['nullable', 'integer'],
        ]);

        $column = KanbanColumn::create($data);

        return response()->json($column, 201);
    }

    public function updateColumn(Request $request, KanbanColumn $column): JsonResponse
    {
        $data = $request->validate([
            'kanban_project_id' => ['required', 'string', 'exists:kanban_projects,id'],
            'title'             => ['required', 'string', 'max:255'],
            'color'             => ['nullable', 'string', 'max:50'],
            'order'             => ['nullable', 'integer'],
        ]);

        $column->update($data);

        return response()->json($column);
    }

    public function destroyColumn(KanbanColumn $column): JsonResponse
    {
        $column->delete();

        return response()->json(null, 204);
    }

    // --- Cards ---

    public function storeCard(Request $request): JsonResponse
    {
        $data = $request->validate([
            'kanban_column_id' => ['required', 'string', 'exists:kanban_columns,id'],
            'title'            => ['required', 'string', 'max:255'],
            'description'      => ['nullable', 'string'],
            'due_date'         => ['nullable', 'date'],
            'order'            => ['nullable', 'integer'],
        ]);

        $card = KanbanCard::create($data);

        return response()->json($card, 201);
    }

    public function updateCard(Request $request, KanbanCard $card): JsonResponse
    {
        $data = $request->validate([
            'kanban_column_id' => ['required', 'string', 'exists:kanban_columns,id'],
            'title'            => ['required', 'string', 'max:255'],
            'description'      => ['nullable', 'string'],
            'due_date'         => ['nullable', 'date'],
            'order'            => ['nullable', 'integer'],
        ]);

        $card->update($data);

        return response()->json($card);
    }

    public function destroyCard(KanbanCard $card): JsonResponse
    {
        $card->delete();

        return response()->json(null, 204);
    }
}
