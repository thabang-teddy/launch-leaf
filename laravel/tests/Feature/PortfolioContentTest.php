<?php

namespace Tests\Feature;

use App\Models\Portfolio;
use App\Models\User;
use App\Services\MarkdownContentStore;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PortfolioContentTest extends TestCase
{
    use RefreshDatabase;

    private string $contentPath;

    protected function setUp(): void
    {
        parent::setUp();

        // Point the content store at an isolated temp dir so tests never touch the repo's content/.
        $this->contentPath = sys_get_temp_dir().DIRECTORY_SEPARATOR.'llcontent_'.uniqid();
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

    public function test_store_writes_a_markdown_file_and_a_listing_row(): void
    {
        $this->post(route('dashboard.portfolio.store'), [
            'title' => 'My Cool App',
            'description' => 'A short blurb',
            'content' => '<p>Full <strong>body</strong>.</p>',
            'tech_stack' => 'Laravel, React',
            'is_active' => true,
        ])->assertRedirect();

        $row = Portfolio::firstWhere('slug', 'my-cool-app');
        $this->assertNotNull($row);
        $this->assertNotNull($row->uuid);

        $file = $this->store()->readItem('portfolio', 'my-cool-app');
        $this->assertNotNull($file);
        $this->assertSame('My Cool App', $file['matter']['title']);
        $this->assertSame(['Laravel', 'React'], $file['matter']['tech_stack']);
        $this->assertSame('<p>Full <strong>body</strong>.</p>', $file['body']);
    }

    public function test_update_rewrites_the_file_and_removes_the_old_one_on_rename(): void
    {
        $this->post(route('dashboard.portfolio.store'), [
            'title' => 'Original Title',
            'content' => '<p>one</p>',
        ])->assertRedirect();

        $item = Portfolio::firstWhere('slug', 'original-title');

        $this->put(route('dashboard.portfolio.update', $item->id), [
            'title' => 'Renamed Title',
            'content' => '<p>two</p>',
        ])->assertRedirect();

        // Old file gone, new file present with new body.
        $this->assertNull($this->store()->readItem('portfolio', 'original-title'));
        $new = $this->store()->readItem('portfolio', 'renamed-title');
        $this->assertNotNull($new);
        $this->assertSame('<p>two</p>', $new['body']);
    }

    public function test_toggle_active_preserves_the_file_body(): void
    {
        $this->post(route('dashboard.portfolio.store'), [
            'title' => 'Keep Body',
            'content' => '<p>keep me</p>',
        ])->assertRedirect();

        $item = Portfolio::firstWhere('slug', 'keep-body');

        $this->patch(route('dashboard.portfolio.toggle-active', $item->id))->assertRedirect();

        $file = $this->store()->readItem('portfolio', 'keep-body');
        $this->assertSame('<p>keep me</p>', $file['body']);
        $this->assertFalse($file['matter']['is_active']);
    }

    public function test_destroy_removes_both_the_row_and_the_file(): void
    {
        $this->post(route('dashboard.portfolio.store'), [
            'title' => 'Delete Me',
            'content' => '<p>x</p>',
        ])->assertRedirect();

        $item = Portfolio::firstWhere('slug', 'delete-me');

        $this->delete(route('dashboard.portfolio.destroy', $item->id))->assertRedirect();

        $this->assertNull(Portfolio::find($item->id));
        $this->assertNull($this->store()->readItem('portfolio', 'delete-me'));
    }

    public function test_sync_inserts_from_new_files_and_deletes_rows_whose_file_is_gone(): void
    {
        // Seed a DB row + file via the normal path.
        $this->post(route('dashboard.portfolio.store'), [
            'title' => 'Stays',
            'content' => '<p>stays</p>',
        ])->assertRedirect();
        $stays = Portfolio::firstWhere('slug', 'stays');

        // A DB row whose file we will remove -> should be deleted on sync.
        $orphan = Portfolio::create(['title' => 'Orphan', 'slug' => 'orphan', 'order' => 5, 'is_active' => true]);

        // A brand-new file with no DB row -> should be inserted on sync.
        $this->store()->writeItem('portfolio', 'from-file', [
            'uuid' => '11111111-1111-1111-1111-111111111111',
            'title' => 'From File',
            'slug' => 'from-file',
            'order' => 9,
            'is_active' => true,
        ], '<p>hi</p>');

        $this->post(route('dashboard.portfolio.sync'))->assertRedirect();

        $this->assertNotNull(Portfolio::firstWhere('uuid', '11111111-1111-1111-1111-111111111111'));
        $this->assertNull(Portfolio::find($orphan->id));          // file was gone -> row deleted
        $this->assertNotNull(Portfolio::find($stays->id));         // still has a file
    }

    public function test_public_show_reads_the_body_from_the_file(): void
    {
        $this->post(route('dashboard.portfolio.store'), [
            'title' => 'Public Item',
            'content' => '<p>public body</p>',
            'is_active' => true,
        ])->assertRedirect();

        $this->get('/portfolio/public-item')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Frontend/Portfolio/Show')
                ->where('item.content', '<p>public body</p>')
            );
    }
}
