<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\KanbanBoard;
use App\Models\KanbanCard;
use App\Models\KanbanColumn;
use App\Models\KanbanProject;
use App\Models\Note;
use App\Models\Task;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FlutterSyncController extends Controller
{
    public function sync(Request $request): JsonResponse
    {
        $request->validate([
            'changes'               => ['required', 'array'],
            'changes.*.local_id'    => ['required', 'integer'],
            'changes.*.table_name'  => ['required', 'string'],
            'changes.*.action_type' => ['required', 'string', 'in:create,update,delete'],
            'changes.*.datetime'    => ['required', 'string'],
            'changes.*.data'        => ['required', 'array'],
        ]);

        $results = [];

        foreach ($request->input('changes') as $change) {
            $results[] = $this->processChange($change);
        }

        return response()->json(['results' => $results]);
    }

    private function processChange(array $change): array
    {
        $action   = $change['action_type'];
        $localId  = (int) $change['local_id'];
        $remoteId = $change['remote_id'] ?? null;
        $datetime = $change['datetime'];
        $data     = $change['data'];

        return match ($change['table_name']) {
            'notes'           => $this->processNote($action, $localId, $remoteId, $datetime, $data),
            'tasks'           => $this->processTask($action, $localId, $remoteId, $datetime, $data),
            'contacts'        => $this->processContact($action, $localId, $remoteId),
            'kanban_boards'   => $this->processKanbanBoard($action, $localId, $remoteId, $datetime, $data),
            'kanban_projects' => $this->processKanbanProject($action, $localId, $remoteId, $datetime, $data),
            'kanban_columns'  => $this->processKanbanColumn($action, $localId, $remoteId, $datetime, $data),
            'kanban_cards'    => $this->processKanbanCard($action, $localId, $remoteId, $datetime, $data),
            default           => $this->deleteResult($localId, $remoteId, $change['table_name']),
        };
    }

    // ── Notes ────────────────────────────────────────────────────────────────

    private function processNote(string $action, int $localId, ?string $remoteId, string $datetime, array $data): array
    {
        if ($action === 'create') {
            $note = Note::create([
                'title'   => $data['title'] ?? '',
                'content' => $data['content'] ?? null,
            ]);
            return $this->successResult($localId, 'notes', $action, $note);
        }

        $note = $remoteId ? Note::find($remoteId) : null;

        if ($action === 'delete') {
            $note?->delete();
            return $this->deleteResult($localId, $remoteId, 'notes');
        }

        // update
        if (! $note) {
            $created = Note::create([
                'title'   => $data['title'] ?? '',
                'content' => $data['content'] ?? null,
            ]);
            return $this->successResult($localId, 'notes', 'create', $created);
        }

        if ($this->isServerNewer($note, $datetime)) {
            return $this->conflictResult($localId, 'notes', $action, $note);
        }

        $note->update([
            'title'   => $data['title'] ?? $note->title,
            'content' => $data['content'] ?? $note->content,
        ]);

        return $this->successResult($localId, 'notes', $action, $note->fresh());
    }

    // ── Tasks ────────────────────────────────────────────────────────────────

    private function processTask(string $action, int $localId, ?string $remoteId, string $datetime, array $data): array
    {
        if ($action === 'create') {
            $task = Task::create([
                'title'        => $data['title'] ?? '',
                'description'  => $data['description'] ?? null,
                'is_completed' => (bool) ($data['is_completed'] ?? false),
                'completed_at' => $data['completed_at'] ?? null,
                'due_date'     => $data['due_date'] ?? null,
                'order_idx'    => $data['order_idx'] ?? 0,
            ]);
            return $this->successResult($localId, 'tasks', $action, $task);
        }

        $task = $remoteId ? Task::find($remoteId) : null;

        if ($action === 'delete') {
            $task?->delete();
            return $this->deleteResult($localId, $remoteId, 'tasks');
        }

        // update
        if (! $task) {
            $created = Task::create([
                'title'        => $data['title'] ?? '',
                'description'  => $data['description'] ?? null,
                'is_completed' => (bool) ($data['is_completed'] ?? false),
                'completed_at' => $data['completed_at'] ?? null,
                'due_date'     => $data['due_date'] ?? null,
                'order_idx'    => $data['order_idx'] ?? 0,
            ]);
            return $this->successResult($localId, 'tasks', 'create', $created);
        }

        if ($this->isServerNewer($task, $datetime)) {
            return $this->conflictResult($localId, 'tasks', $action, $task);
        }

        $task->update([
            'title'        => $data['title'] ?? $task->title,
            'description'  => $data['description'] ?? $task->description,
            'is_completed' => (bool) ($data['is_completed'] ?? $task->is_completed),
            'completed_at' => $data['completed_at'] ?? $task->completed_at,
            'due_date'     => $data['due_date'] ?? $task->due_date,
            'order_idx'    => $data['order_idx'] ?? $task->order_idx,
        ]);

        return $this->successResult($localId, 'tasks', $action, $task->fresh());
    }

    // ── Contacts (server-originated; only deletes are accepted) ──────────────

    private function processContact(string $action, int $localId, ?string $remoteId): array
    {
        if ($action === 'delete' && $remoteId) {
            $contact = Contact::find($remoteId);
            $contact?->delete();
        }
        return $this->deleteResult($localId, $remoteId, 'contacts');
    }

    // ── Kanban Boards ────────────────────────────────────────────────────────

    private function processKanbanBoard(string $action, int $localId, ?string $remoteId, string $datetime, array $data): array
    {
        if ($action === 'create') {
            $board = KanbanBoard::create([
                'name'        => $data['name'] ?? '',
                'description' => $data['description'] ?? '',
                'color'       => $data['color'] ?? '#1a1a2e',
            ]);
            return $this->successResult($localId, 'kanban_boards', $action, $board);
        }

        $board = $remoteId ? KanbanBoard::find($remoteId) : null;

        if ($action === 'delete') {
            $board?->delete();
            return $this->deleteResult($localId, $remoteId, 'kanban_boards');
        }

        if (! $board) {
            $created = KanbanBoard::create([
                'name'        => $data['name'] ?? '',
                'description' => $data['description'] ?? '',
                'color'       => $data['color'] ?? '#1a1a2e',
            ]);
            return $this->successResult($localId, 'kanban_boards', 'create', $created);
        }

        if ($this->isServerNewer($board, $datetime)) {
            return $this->conflictResult($localId, 'kanban_boards', $action, $board);
        }

        $board->update([
            'name'        => $data['name'] ?? $board->name,
            'description' => $data['description'] ?? $board->description,
            'color'       => $data['color'] ?? $board->color,
        ]);

        return $this->successResult($localId, 'kanban_boards', $action, $board->fresh());
    }

    // ── Kanban Projects ──────────────────────────────────────────────────────

    private function processKanbanProject(string $action, int $localId, ?string $remoteId, string $datetime, array $data): array
    {
        if ($action === 'create') {
            $project = KanbanProject::create([
                'kanban_board_id' => $data['remote_board_id'] ?? null,
                'name'            => $data['name'] ?? '',
                'description'     => $data['description'] ?? '',
                'color'           => $data['color'] ?? '#e74c3c',
            ]);
            return $this->successResult($localId, 'kanban_projects', $action, $project);
        }

        $project = $remoteId ? KanbanProject::find($remoteId) : null;

        if ($action === 'delete') {
            $project?->delete();
            return $this->deleteResult($localId, $remoteId, 'kanban_projects');
        }

        if (! $project) {
            $created = KanbanProject::create([
                'kanban_board_id' => $data['remote_board_id'] ?? null,
                'name'            => $data['name'] ?? '',
                'description'     => $data['description'] ?? '',
                'color'           => $data['color'] ?? '#e74c3c',
            ]);
            return $this->successResult($localId, 'kanban_projects', 'create', $created);
        }

        if ($this->isServerNewer($project, $datetime)) {
            return $this->conflictResult($localId, 'kanban_projects', $action, $project);
        }

        $project->update([
            'name'        => $data['name'] ?? $project->name,
            'description' => $data['description'] ?? $project->description,
            'color'       => $data['color'] ?? $project->color,
        ]);

        return $this->successResult($localId, 'kanban_projects', $action, $project->fresh());
    }

    // ── Kanban Columns ───────────────────────────────────────────────────────

    private function processKanbanColumn(string $action, int $localId, ?string $remoteId, string $datetime, array $data): array
    {
        if ($action === 'create') {
            $column = KanbanColumn::create([
                'kanban_project_id' => $data['remote_project_id'] ?? null,
                'title'             => $data['title'] ?? '',
                'color'             => $data['color'] ?? '#1a1a2e',
            ]);
            return $this->successResult($localId, 'kanban_columns', $action, $column);
        }

        $column = $remoteId ? KanbanColumn::find($remoteId) : null;

        if ($action === 'delete') {
            $column?->delete();
            return $this->deleteResult($localId, $remoteId, 'kanban_columns');
        }

        if (! $column) {
            $created = KanbanColumn::create([
                'kanban_project_id' => $data['remote_project_id'] ?? null,
                'title'             => $data['title'] ?? '',
                'color'             => $data['color'] ?? '#1a1a2e',
            ]);
            return $this->successResult($localId, 'kanban_columns', 'create', $created);
        }

        if ($this->isServerNewer($column, $datetime)) {
            return $this->conflictResult($localId, 'kanban_columns', $action, $column);
        }

        $column->update([
            'title' => $data['title'] ?? $column->title,
            'color' => $data['color'] ?? $column->color,
        ]);

        return $this->successResult($localId, 'kanban_columns', $action, $column->fresh());
    }

    // ── Kanban Cards ─────────────────────────────────────────────────────────

    private function processKanbanCard(string $action, int $localId, ?string $remoteId, string $datetime, array $data): array
    {
        if ($action === 'create') {
            $card = KanbanCard::create([
                'kanban_column_id' => $data['remote_column_id'] ?? null,
                'title'            => $data['title'] ?? '',
                'description'      => $data['description'] ?? '',
                'due_date'         => $data['due_date'] ?? null,
            ]);
            return $this->successResult($localId, 'kanban_cards', $action, $card);
        }

        $card = $remoteId ? KanbanCard::find($remoteId) : null;

        if ($action === 'delete') {
            $card?->delete();
            return $this->deleteResult($localId, $remoteId, 'kanban_cards');
        }

        if (! $card) {
            $created = KanbanCard::create([
                'kanban_column_id' => $data['remote_column_id'] ?? null,
                'title'            => $data['title'] ?? '',
                'description'      => $data['description'] ?? '',
                'due_date'         => $data['due_date'] ?? null,
            ]);
            return $this->successResult($localId, 'kanban_cards', 'create', $created);
        }

        if ($this->isServerNewer($card, $datetime)) {
            return $this->conflictResult($localId, 'kanban_cards', $action, $card);
        }

        $card->update([
            'title'       => $data['title'] ?? $card->title,
            'description' => $data['description'] ?? $card->description,
            'due_date'    => $data['due_date'] ?? $card->due_date,
        ]);

        return $this->successResult($localId, 'kanban_cards', $action, $card->fresh());
    }

    // ── Result builders ──────────────────────────────────────────────────────

    private function successResult(int $localId, string $tableName, string $actionType, Model $record): array
    {
        return [
            'local_id'       => $localId,
            'remote_id'      => (string) $record->id,
            'table_name'     => $tableName,
            'action_type'    => $actionType,
            'datetime'       => $record->updated_at?->toIso8601String(),
            'data'           => $record->toArray(),
            'synced_success' => true,
        ];
    }

    private function conflictResult(int $localId, string $tableName, string $actionType, Model $record): array
    {
        return [
            'local_id'       => $localId,
            'remote_id'      => (string) $record->id,
            'table_name'     => $tableName,
            'action_type'    => $actionType,
            'datetime'       => $record->updated_at?->toIso8601String(),
            'data'           => $record->toArray(),
            'synced_success' => false,
        ];
    }

    private function deleteResult(int $localId, ?string $remoteId, string $tableName): array
    {
        return [
            'local_id'       => $localId,
            'remote_id'      => $remoteId,
            'table_name'     => $tableName,
            'action_type'    => 'delete',
            'datetime'       => Carbon::now()->toIso8601String(),
            'data'           => null,
            'synced_success' => true,
        ];
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private function isServerNewer(Model $record, string $datetime): bool
    {
        $serverDate = Carbon::parse($record->updated_at);
        $localDate  = Carbon::parse($datetime);

        return $serverDate->gt($localDate);
    }
}
