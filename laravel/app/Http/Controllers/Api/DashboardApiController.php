<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\KanbanBoard;
use App\Models\KanbanCard;
use App\Models\Note;
use App\Models\Task;
use Illuminate\Http\JsonResponse;

class DashboardApiController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'notes_count'      => Note::count(),
            'tasks_total'      => Task::count(),
            'tasks_pending'    => Task::where('is_completed', false)->count(),
            'tasks_done'       => Task::where('is_completed', true)->count(),
            'contacts_total'   => Contact::count(),
            'contacts_pending' => Contact::whereNull('replied_at')->count(),
            'kanban_boards'    => KanbanBoard::count(),
            'kanban_cards'     => KanbanCard::count(),
        ]);
    }
}
