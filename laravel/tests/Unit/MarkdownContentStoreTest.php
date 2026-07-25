<?php

namespace Tests\Unit;

use App\Services\MarkdownContentStore;
use PHPUnit\Framework\TestCase;

class MarkdownContentStoreTest extends TestCase
{
    private string $base;

    private MarkdownContentStore $store;

    protected function setUp(): void
    {
        parent::setUp();
        $this->base = sys_get_temp_dir().DIRECTORY_SEPARATOR.'mcs_'.uniqid();
        $this->store = new MarkdownContentStore($this->base);
    }

    protected function tearDown(): void
    {
        $this->store->deleteDirectory(''); // wipe the whole temp root
        parent::tearDown();
    }

    public function test_render_then_parse_round_trips_frontmatter_and_body(): void
    {
        $matter = ['uuid' => 'abc-123', 'title' => 'Hello', 'tags' => ['a', 'b'], 'is_active' => true, 'order' => 3];
        $body = "<p>Some <strong>HTML</strong> body.</p>\nSecond line.";

        $parsed = $this->store->parse($this->store->render($matter, $body));

        $this->assertSame($matter, $parsed['matter']);
        $this->assertSame($body, $parsed['body']);
    }

    public function test_write_item_then_read_item_returns_same_data(): void
    {
        $this->store->writeItem('portfolio', 'my-project', ['uuid' => 'u1', 'title' => 'My Project'], 'Full body.');

        $read = $this->store->readItem('portfolio', 'my-project');

        $this->assertNotNull($read);
        $this->assertSame('my-project', $read['slug']);
        $this->assertSame('My Project', $read['matter']['title']);
        $this->assertSame('Full body.', $read['body']);
    }

    public function test_read_missing_item_returns_null(): void
    {
        $this->assertNull($this->store->readItem('portfolio', 'nope'));
    }

    public function test_all_items_lists_files_and_honors_ignore_list(): void
    {
        $this->store->writeItem('kanban/board-a', 'board', ['name' => 'Board A'], '');
        $this->store->writeItem('kanban/board-a', 'project-1', ['name' => 'Project 1'], 'desc');
        $this->store->writeItem('kanban/board-a', 'project-2', ['name' => 'Project 2'], 'desc');

        $projects = $this->store->allItems('kanban/board-a', ignore: ['board']);

        $slugs = array_column($projects, 'slug');
        sort($slugs);
        $this->assertSame(['project-1', 'project-2'], $slugs);
    }

    public function test_list_directories_returns_subfolders(): void
    {
        $this->store->writeItem('kanban/board-a', 'board', ['name' => 'A'], '');
        $this->store->writeItem('kanban/board-b', 'board', ['name' => 'B'], '');

        $dirs = $this->store->listDirectories('kanban');
        sort($dirs);

        $this->assertSame(['board-a', 'board-b'], $dirs);
    }

    public function test_delete_item_removes_the_file(): void
    {
        $this->store->writeItem('notes', 'note-1', ['title' => 'N'], 'body');
        $this->assertTrue($this->store->deleteItem('notes', 'note-1'));
        $this->assertNull($this->store->readItem('notes', 'note-1'));
        $this->assertFalse($this->store->deleteItem('notes', 'note-1'));
    }

    public function test_slug_is_sanitized_against_path_traversal(): void
    {
        $path = $this->store->writeItem('notes', '../../evil', ['title' => 'X'], 'body');

        // The file must land inside the notes section, not escape the base path.
        $this->assertStringContainsString('notes', $path);
        $this->assertStringNotContainsString('..', $path);
        $this->assertFileExists($path);
    }

    public function test_collection_style_frontmatter_list_round_trips(): void
    {
        $items = [
            ['uuid' => 's1', 'name' => 'Laravel', 'order' => 1, 'description' => 'PHP framework'],
            ['uuid' => 's2', 'name' => 'React', 'order' => 2, 'description' => "Line one\nLine two"],
        ];

        $this->store->writeItem('skills', 'skills', ['items' => $items], '');
        $read = $this->store->readItem('skills', 'skills');

        $this->assertSame($items, $read['matter']['items']);
    }
}
