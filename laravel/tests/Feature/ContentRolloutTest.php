<?php

namespace Tests\Feature;

use App\Models\Experience;
use App\Models\KanbanProject;
use App\Models\Note;
use App\Models\Skill;
use App\Models\Task;
use App\Models\User;
use App\Services\MarkdownContentStore;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContentRolloutTest extends TestCase
{
    use RefreshDatabase;

    private string $contentPath;

    protected function setUp(): void
    {
        parent::setUp();
        $this->contentPath = sys_get_temp_dir().DIRECTORY_SEPARATOR.'llroll_'.uniqid();
        config(['content.path' => $this->contentPath]);
        $this->actingAs(User::factory()->create());
    }

    protected function tearDown(): void
    {
        (new MarkdownContentStore($this->contentPath))->deleteDirectory('');
        parent::tearDown();
    }

    private function store(): MarkdownContentStore
    {
        return new MarkdownContentStore($this->contentPath);
    }

    // ── Experience (item section) ─────────────────────────────────────────────

    public function test_experience_store_writes_file_and_show_reads_body(): void
    {
        $this->post(route('dashboard.experience.store'), [
            'title' => 'Senior Dev',
            'company' => 'Acme',
            'start_date' => '2020-01-01',
            'type' => 'work',
            'description' => '<p>Did great things.</p>',
        ])->assertRedirect();

        $file = $this->store()->readItem('experience', 'senior-dev');
        $this->assertNotNull($file);
        $this->assertSame('<p>Did great things.</p>', $file['body']);
        $this->assertSame('Acme', $file['matter']['company']);

        $this->get('/experience/senior-dev')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Frontend/Experience/Show')
                ->where('experience.description', '<p>Did great things.</p>'));
    }

    // ── Notes (item section, derived slug) ────────────────────────────────────

    public function test_note_store_writes_a_uuid_stamped_file(): void
    {
        $this->post(route('dashboard.notes.store'), [
            'title' => 'My Note',
            'content' => '<p>note body</p>',
        ])->assertRedirect();

        $note = Note::firstWhere('title', 'My Note');
        $files = $this->store()->allItems('notes');

        $this->assertCount(1, $files);
        $this->assertStringStartsWith('my-note-', $files[0]['slug']);
        $this->assertStringContainsString(substr($note->uuid, 0, 8), $files[0]['slug']);
        $this->assertSame('<p>note body</p>', $files[0]['body']);
    }

    // ── Skills (collection section) ───────────────────────────────────────────

    public function test_skill_store_rebuilds_collection_and_sync_deletes_orphans(): void
    {
        $this->post(route('dashboard.skills.store'), ['name' => 'Laravel'])->assertRedirect();

        $file = $this->store()->readItem('skills', 'skills');
        $this->assertCount(1, $file['matter']['items']);
        $this->assertSame('Laravel', $file['matter']['items'][0]['name']);

        // A row created outside the app (no file rewrite) must be removed on sync.
        $orphan = Skill::create(['name' => 'Ghost', 'order' => 9]);

        $this->post(route('dashboard.skills.sync'))->assertRedirect();

        $this->assertNull(Skill::find($orphan->id));
        $this->assertNotNull(Skill::firstWhere('name', 'Laravel'));
    }

    // ── Tasks (collection section) ────────────────────────────────────────────

    public function test_task_store_and_update_rewrite_the_collection_file(): void
    {
        $this->post(route('dashboard.tasks.store'), ['title' => 'Do thing'])->assertRedirect();
        $task = Task::firstWhere('title', 'Do thing');

        $this->put(route('dashboard.tasks.update', $task->id), [
            'title' => 'Do thing',
            'is_completed' => true,
        ])->assertRedirect();

        $items = $this->store()->readItem('tasks', 'tasks')['matter']['items'];
        $this->assertCount(1, $items);
        $this->assertTrue($items[0]['is_completed']);
    }

    // ── Kanban (observer-driven export + sync) ────────────────────────────────

    public function test_creating_a_project_writes_kanban_files_via_observer(): void
    {
        $this->post(route('dashboard.kanban.projects.store'), ['name' => 'Test Proj'])->assertRedirect();

        // The deferred export runs on request termination (which the test harness triggers).
        $this->assertNotNull($this->store()->readItem('kanban/default', 'board'));
        $this->assertNotNull($this->store()->readItem('kanban/default', 'test-proj'));
    }

    public function test_kanban_sync_deletes_a_project_whose_file_is_gone(): void
    {
        $this->post(route('dashboard.kanban.projects.store'), ['name' => 'Test Proj'])->assertRedirect();
        $project = KanbanProject::firstWhere('name', 'Test Proj');

        // Remove the project's file, then sync — files are authoritative.
        $this->store()->deleteItem('kanban/default', 'test-proj');

        $this->post(route('dashboard.kanban.sync'))->assertRedirect();

        $this->assertNull(KanbanProject::find($project->id));
    }
}
