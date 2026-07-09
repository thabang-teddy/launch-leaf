<?php

namespace Tests\Feature;

use App\Models\KanbanBoard;
use App\Models\KanbanCard;
use App\Models\KanbanColumn;
use App\Models\KanbanProject;
use App\Models\Note;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FlutterSyncTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Sanctum::actingAs(User::factory()->create());
    }

    private function change(string $table, string $action, int $localId, array $data, ?string $remoteId = null): array
    {
        return [
            'local_id'    => $localId,
            'remote_id'   => $remoteId,
            'table_name'  => $table,
            'action_type' => $action,
            'datetime'    => now()->toIso8601String(),
            'data'        => $data,
        ];
    }

    public function test_one_failing_change_does_not_abort_the_batch(): void
    {
        $response = $this->postJson('/api/sync/changes', [
            'changes' => [
                // Card referencing a column that does not exist anywhere —
                // violates the NOT NULL constraint on kanban_column_id.
                $this->change('kanban_cards', 'create', 7, [
                    'id'               => 7,
                    'remote_id'        => null,
                    'column_id'        => 999,
                    'remote_column_id' => null,
                    'title'            => 'Orphan card',
                    'description'      => '',
                ]),
                $this->change('notes', 'create', 3, [
                    'id'      => 3,
                    'title'   => 'Survives the batch',
                    'content' => 'body',
                ]),
            ],
        ]);

        $response->assertOk();
        $results = $response->json('results');

        $this->assertFalse($results[0]['synced_success']);
        $this->assertNull($results[0]['data']);
        $this->assertSame(7, $results[0]['local_id']);

        $this->assertTrue($results[1]['synced_success']);
        $this->assertDatabaseHas('notes', ['title' => 'Survives the batch']);
        $this->assertDatabaseCount('kanban_cards', 0);
    }

    public function test_offline_created_hierarchy_is_linked_within_one_batch(): void
    {
        $response = $this->postJson('/api/sync/changes', [
            'changes' => [
                $this->change('kanban_boards', 'create', 1, [
                    'id' => 1, 'remote_id' => null,
                    'name' => 'Board', 'description' => '', 'color' => '#111',
                ]),
                $this->change('kanban_projects', 'create', 2, [
                    'id' => 2, 'remote_id' => null,
                    'board_id' => 1, 'remote_board_id' => null,
                    'name' => 'Project', 'description' => '', 'color' => '#222',
                ]),
                $this->change('kanban_columns', 'create', 3, [
                    'id' => 3, 'remote_id' => null,
                    'project_id' => 2, 'remote_project_id' => null,
                    'title' => 'Column', 'color' => '#333',
                ]),
                $this->change('kanban_cards', 'create', 4, [
                    'id' => 4, 'remote_id' => null,
                    'column_id' => 3, 'remote_column_id' => null,
                    'title' => 'Card', 'description' => '',
                ]),
            ],
        ]);

        $response->assertOk();
        foreach ($response->json('results') as $result) {
            $this->assertTrue($result['synced_success'], $result['table_name'] . ' failed to sync');
        }

        $board   = KanbanBoard::sole();
        $project = KanbanProject::sole();
        $column  = KanbanColumn::sole();
        $card    = KanbanCard::sole();

        $this->assertSame($board->id, $project->kanban_board_id);
        $this->assertSame($project->id, $column->kanban_project_id);
        $this->assertSame($column->id, $card->kanban_column_id);
    }

    public function test_child_create_with_known_parent_remote_id_still_links(): void
    {
        $board = KanbanBoard::create(['name' => 'Existing', 'description' => '', 'color' => '#111']);

        $response = $this->postJson('/api/sync/changes', [
            'changes' => [
                $this->change('kanban_projects', 'create', 10, [
                    'id' => 10, 'remote_id' => null,
                    'board_id' => 5, 'remote_board_id' => $board->id,
                    'name' => 'Project', 'description' => '', 'color' => '#222',
                ]),
            ],
        ]);

        $response->assertOk();
        $this->assertTrue($response->json('results.0.synced_success'));
        $this->assertSame($board->id, KanbanProject::sole()->kanban_board_id);
    }

    public function test_server_newer_update_returns_conflict_with_server_data(): void
    {
        $note = Note::create(['title' => 'Server title', 'content' => 'server']);
        // Server record updated after the client's change was recorded.
        $staleClientTime = now()->subHour()->toIso8601String();

        $response = $this->postJson('/api/sync/changes', [
            'changes' => [
                [
                    'local_id'    => 1,
                    'remote_id'   => (string) $note->id,
                    'table_name'  => 'notes',
                    'action_type' => 'update',
                    'datetime'    => $staleClientTime,
                    'data'        => ['title' => 'Stale client title', 'content' => 'client'],
                ],
            ],
        ]);

        $response->assertOk();
        $result = $response->json('results.0');

        $this->assertFalse($result['synced_success']);
        $this->assertSame('Server title', $result['data']['title']);
        $this->assertDatabaseHas('notes', ['title' => 'Server title']);
    }

    public function test_create_returns_remote_id_for_client_backfill(): void
    {
        $response = $this->postJson('/api/sync/changes', [
            'changes' => [
                $this->change('tasks', 'create', 12, [
                    'id' => 12, 'title' => 'New task', 'description' => '',
                    'is_completed' => 0, 'order_idx' => 0,
                ]),
            ],
        ]);

        $response->assertOk();
        $result = $response->json('results.0');

        $this->assertTrue($result['synced_success']);
        $this->assertNotNull($result['remote_id']);
        $this->assertSame(12, $result['local_id']);
    }
}
