<?php

namespace App\Services;

use App\Models\Experience;
use App\Models\KanbanBoard;
use App\Models\KanbanCard;
use App\Models\KanbanColumn;
use App\Models\KanbanProject;
use App\Models\Note;
use App\Models\Portfolio;
use App\Models\Skill;
use App\Models\Task;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

/**
 * Maps content models <-> markdown files and keeps the DB listing index in sync.
 *
 * Three shapes of section:
 *  - "item"       one file per record; body = the long-form field (dropped from the DB).
 *                 Portfolio, Experience, Notes.
 *  - "collection" one file for the whole section; frontmatter carries an `items` list.
 *                 The DB row stays complete — the file is a full mirror. Skills, Tasks.
 *  - "kanban"     one folder per board, one file per project (columns/cards nested).
 *                 The DB stays complete; the whole tree is re-exported on any change.
 *
 * Sync treats files as authoritative: rows whose file/entry is gone are deleted.
 */
class ContentSyncService
{
    /**
     * Item sections: one file per row, one long-form body field.
     *
     * `db_body` = whether the body column still exists in the database. Portfolio
     * and Experience dropped it (the file is the sole source of truth). Notes keeps
     * it because the Flutter app syncs `notes.content` through the DB.
     */
    private const ITEM_SECTIONS = [
        'portfolio' => [
            'model' => Portfolio::class,
            'body' => 'content',
            'slug' => 'slug',
            'db_body' => false,
            'front' => ['uuid', 'title', 'slug', 'description', 'image_path', 'tech_stack', 'live_url', 'repo_url', 'order', 'is_active'],
        ],
        'experience' => [
            'model' => Experience::class,
            'body' => 'description',
            'slug' => 'slug',
            'db_body' => false,
            'front' => ['uuid', 'title', 'slug', 'company', 'summary', 'location', 'start_date', 'end_date', 'is_current', 'type', 'order'],
        ],
        'notes' => [
            'model' => Note::class,
            'body' => 'content',
            'slug' => null, // derived from title
            'db_body' => true,
            'front' => ['uuid', 'title'],
        ],
    ];

    /** Collection sections: whole section in one file, DB row kept complete. */
    private const COLLECTION_SECTIONS = [
        'skills' => [
            'model' => Skill::class,
            'front' => ['uuid', 'name', 'icon', 'description', 'order'],
            'order' => 'order',
        ],
        'tasks' => [
            'model' => Task::class,
            'front' => ['uuid', 'title', 'description', 'is_completed', 'completed_at', 'due_date', 'order'],
            'order' => 'order',
        ],
    ];

    public function __construct(private MarkdownContentStore $store) {}

    /** All section keys that have a Sync button. */
    public function sections(): array
    {
        return [...array_keys(self::ITEM_SECTIONS), ...array_keys(self::COLLECTION_SECTIONS), 'kanban'];
    }

    // ── Export (DB -> files) ───────────────────────────────────────────────────

    /** Export every section to files. Returns per-section counts. */
    public function exportAll(): array
    {
        $counts = [];

        foreach (array_keys(self::ITEM_SECTIONS) as $key) {
            $counts[$key] = $this->exportItemSection($key);
        }
        foreach (array_keys(self::COLLECTION_SECTIONS) as $key) {
            $counts[$key] = $this->rebuildCollection($key);
        }
        $counts['kanban'] = $this->exportKanban();

        return $counts;
    }

    /** Dispatch a single-section sync (files -> DB). Returns a stats array. */
    public function syncSection(string $key): array
    {
        if (isset(self::ITEM_SECTIONS[$key])) {
            return $this->syncItemSection($key);
        }
        if (isset(self::COLLECTION_SECTIONS[$key])) {
            return $this->syncCollection($key);
        }
        if ($key === 'kanban') {
            return $this->syncKanban();
        }

        throw new \InvalidArgumentException("Unknown content section [$key].");
    }

    // ── Item sections ──────────────────────────────────────────────────────────

    private function exportItemSection(string $key): int
    {
        $cfg = self::ITEM_SECTIONS[$key];
        $used = [];
        $n = 0;

        foreach ($cfg['model']::all() as $model) {
            $slug = $this->itemSlug($cfg, $model, $used);

            // When the body column is gone, preserve the existing file body instead
            // of overwriting it with an empty DB value — keeps re-export idempotent.
            $body = $cfg['db_body']
                ? (string) ($model->{$cfg['body']} ?? '')
                : ($this->store->readItem($key, $slug)['body'] ?? '');

            $this->store->writeItem($key, $slug, $this->itemFrontmatter($cfg, $model), $body);
            $n++;
        }

        return $n;
    }

    /** Write (or rewrite) one item's file. Pass $previousSlug on rename to remove the stale file. */
    public function writeItemModel(string $key, Model $model, ?string $previousSlug = null): void
    {
        $cfg = self::ITEM_SECTIONS[$key];
        $used = [];
        $slug = $this->itemSlug($cfg, $model, $used);

        if ($previousSlug !== null && $previousSlug !== $slug) {
            $this->store->deleteItem($key, $previousSlug);
        }

        $this->store->writeItem($key, $slug, $this->itemFrontmatter($cfg, $model), (string) ($model->{$cfg['body']} ?? ''));
    }

    public function deleteItemModel(string $key, Model $model): void
    {
        $cfg = self::ITEM_SECTIONS[$key];
        $used = [];
        $this->store->deleteItem($key, $this->itemSlug($cfg, $model, $used));
    }

    /** Read one item's long-form body from its file (for detail pages). */
    public function readItemBody(string $key, Model $model): string
    {
        $cfg = self::ITEM_SECTIONS[$key];
        $used = [];
        $file = $this->store->readItem($key, $this->itemSlug($cfg, $model, $used));

        return $file['body'] ?? '';
    }

    private function syncItemSection(string $key): array
    {
        $cfg = self::ITEM_SECTIONS[$key];
        $model = $cfg['model'];
        $seen = [];

        foreach ($this->store->allItems($key) as $file) {
            $matter = $file['matter'];
            $uuid = $matter['uuid'] ?? null;

            if (! $uuid) {
                continue; // skip files with no identity
            }

            $attrs = $this->itemAttributesFromMatter($cfg, $matter);

            // Only write the body back to the DB for sections that still have the column.
            if ($cfg['db_body']) {
                $attrs[$cfg['body']] = $file['body'];
            }

            $model::updateOrCreate(['uuid' => $uuid], $attrs);
            $seen[] = $uuid;
        }

        $deleted = $model::whereNotIn('uuid', $seen ?: ['__none__'])->delete();

        return ['synced' => count($seen), 'deleted' => $deleted];
    }

    private function itemFrontmatter(array $cfg, Model $model): array
    {
        $fm = [];
        foreach ($cfg['front'] as $field) {
            $fm[$field] = $this->frontmatterValue($model, $field);
        }

        return $fm;
    }

    /** Only the frontmatter fields map back to DB columns; the body is handled separately. */
    private function itemAttributesFromMatter(array $cfg, array $matter): array
    {
        $attrs = [];
        foreach ($cfg['front'] as $field) {
            if ($field === 'uuid') {
                continue;
            }
            $attrs[$field] = $matter[$field] ?? null;
        }

        return $attrs;
    }

    /** Public helper: the file slug an item currently maps to (used to clean up on rename). */
    public function itemSlugFor(string $key, Model $model): string
    {
        $used = [];

        return $this->itemSlug(self::ITEM_SECTIONS[$key], $model, $used);
    }

    private function itemSlug(array $cfg, Model $model, array &$used): string
    {
        if ($cfg['slug']) {
            return (string) $model->{$cfg['slug']};
        }

        // Slugless sections (notes) derive a stable, collision-proof name from the
        // title plus a short uuid fragment, so duplicate titles never clash and the
        // name stays constant across content edits.
        $base = Str::slug((string) ($model->title ?? '')) ?: 'note';

        return $base.'-'.substr((string) $model->uuid, 0, 8);
    }

    // ── Collection sections ─────────────────────────────────────────────────────

    /** Rebuild the single collection file for a section from all its rows. */
    public function rebuildCollection(string $key): int
    {
        $cfg = self::COLLECTION_SECTIONS[$key];
        $items = [];

        foreach ($cfg['model']::orderBy($cfg['order'])->get() as $model) {
            $items[] = $this->collectionItem($cfg, $model);
        }

        $this->store->writeItem($key, $key, ['items' => $items], '');

        return count($items);
    }

    private function syncCollection(string $key): array
    {
        $cfg = self::COLLECTION_SECTIONS[$key];
        $model = $cfg['model'];
        $file = $this->store->readItem($key, $key);
        $items = $file['matter']['items'] ?? [];
        $seen = [];

        foreach ($items as $item) {
            $uuid = $item['uuid'] ?? null;
            if (! $uuid) {
                continue;
            }

            $attrs = [];
            foreach ($cfg['front'] as $field) {
                if ($field !== 'uuid') {
                    $attrs[$field] = $item[$field] ?? null;
                }
            }

            $model::updateOrCreate(['uuid' => $uuid], $attrs);
            $seen[] = $uuid;
        }

        $deleted = $model::whereNotIn('uuid', $seen ?: ['__none__'])->delete();

        return ['synced' => count($seen), 'deleted' => $deleted];
    }

    private function collectionItem(array $cfg, Model $model): array
    {
        $item = [];
        foreach ($cfg['front'] as $field) {
            $item[$field] = $this->frontmatterValue($model, $field);
        }

        return $item;
    }

    // ── Kanban ───────────────────────────────────────────────────────────────────

    /** Re-export the whole kanban tree (clears content/kanban first). Returns board count. */
    public function exportKanban(): int
    {
        $this->store->deleteDirectory('kanban');

        $boards = KanbanBoard::with('projects.columns.cards')->orderBy('order')->get();
        $usedBoard = [];

        foreach ($boards as $board) {
            $boardSlug = $this->dedupeSlug(Str::slug($board->name) ?: 'board', $usedBoard);
            $section = 'kanban/'.$boardSlug;

            $this->store->writeItem($section, 'board', [
                'uuid' => $board->id,
                'name' => $board->name,
                'color' => $board->color,
                'order' => $board->order,
            ], (string) ($board->description ?? ''));

            $usedProject = ['board']; // reserve the board file stem
            foreach ($board->projects as $project) {
                $projectSlug = $this->dedupeSlug(Str::slug($project->name) ?: 'project', $usedProject);
                $this->store->writeItem($section, $projectSlug, $this->kanbanProjectFrontmatter($project), (string) ($project->description ?? ''));
            }
        }

        return $boards->count();
    }

    private function kanbanProjectFrontmatter(KanbanProject $project): array
    {
        $columns = [];
        foreach ($project->columns as $column) {
            $cards = [];
            foreach ($column->cards as $card) {
                $cards[] = [
                    'uuid' => $card->id,
                    'title' => $card->title,
                    'description' => (string) ($card->description ?? ''),
                    'due_date' => $card->due_date?->format('Y-m-d'),
                    'order' => $card->order,
                ];
            }
            $columns[] = [
                'uuid' => $column->id,
                'title' => $column->title,
                'color' => $column->color,
                'order' => $column->order,
                'cards' => $cards,
            ];
        }

        return [
            'uuid' => $project->id,
            'name' => $project->name,
            'color' => $project->color,
            'order' => $project->order,
            'columns' => $columns,
        ];
    }

    private function syncKanban(): array
    {
        $boardIds = [];
        $projIds = [];
        $colIds = [];
        $cardIds = [];

        foreach ($this->store->listDirectories('kanban') as $boardDir) {
            $section = 'kanban/'.$boardDir;
            $boardFile = $this->store->readItem($section, 'board');
            if (! $boardFile || empty($boardFile['matter']['uuid'])) {
                continue;
            }

            $bm = $boardFile['matter'];
            KanbanBoard::updateOrCreate(['id' => $bm['uuid']], [
                'name' => $bm['name'] ?? 'Board',
                'description' => $boardFile['body'],
                'color' => $bm['color'] ?? '#2DC9A2',
                'order' => $bm['order'] ?? 0,
            ]);
            $boardIds[] = $bm['uuid'];

            foreach ($this->store->allItems($section, ignore: ['board']) as $projFile) {
                $pm = $projFile['matter'];
                if (empty($pm['uuid'])) {
                    continue;
                }

                KanbanProject::updateOrCreate(['id' => $pm['uuid']], [
                    'kanban_board_id' => $bm['uuid'],
                    'name' => $pm['name'] ?? 'Project',
                    'description' => $projFile['body'],
                    'color' => $pm['color'] ?? '#2DC9A2',
                    'order' => $pm['order'] ?? 0,
                ]);
                $projIds[] = $pm['uuid'];

                foreach ($pm['columns'] ?? [] as $col) {
                    if (empty($col['uuid'])) {
                        continue;
                    }
                    KanbanColumn::updateOrCreate(['id' => $col['uuid']], [
                        'kanban_project_id' => $pm['uuid'],
                        'title' => $col['title'] ?? '',
                        'color' => $col['color'] ?? '#6c757d',
                        'order' => $col['order'] ?? 0,
                    ]);
                    $colIds[] = $col['uuid'];

                    foreach ($col['cards'] ?? [] as $card) {
                        if (empty($card['uuid'])) {
                            continue;
                        }
                        KanbanCard::updateOrCreate(['id' => $card['uuid']], [
                            'kanban_column_id' => $col['uuid'],
                            'title' => $card['title'] ?? '',
                            'description' => $card['description'] ?? '',
                            'due_date' => $card['due_date'] ?? null,
                            'order' => $card['order'] ?? 0,
                        ]);
                        $cardIds[] = $card['uuid'];
                    }
                }
            }
        }

        $d = KanbanBoard::whereNotIn('id', $boardIds ?: ['__none__'])->delete();
        $d += KanbanProject::whereNotIn('id', $projIds ?: ['__none__'])->delete();
        $d += KanbanColumn::whereNotIn('id', $colIds ?: ['__none__'])->delete();
        $d += KanbanCard::whereNotIn('id', $cardIds ?: ['__none__'])->delete();

        return ['boards' => count($boardIds), 'projects' => count($projIds), 'deleted' => $d];
    }

    // ── Shared helpers ───────────────────────────────────────────────────────────

    /** Format a model attribute for frontmatter (dates -> strings). */
    private function frontmatterValue(Model $model, string $field)
    {
        $value = $model->{$field};

        if ($value instanceof \DateTimeInterface) {
            $cast = $model->getCasts()[$field] ?? '';

            return $cast === 'date' ? $value->format('Y-m-d') : $value->format(\DateTimeInterface::ATOM);
        }

        return $value;
    }

    private function dedupeSlug(string $base, array &$used): string
    {
        $slug = $base;
        $i = 2;
        while (in_array($slug, $used, true)) {
            $slug = $base.'-'.$i++;
        }
        $used[] = $slug;

        return $slug;
    }
}
