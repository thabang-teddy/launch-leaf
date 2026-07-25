<?php

namespace App\Services;

use Symfony\Component\Yaml\Yaml;

/**
 * Reads and writes content items as Markdown files with YAML frontmatter.
 *
 * File shape:
 *
 *     ---
 *     uuid: 550e8400-...
 *     title: My Project
 *     ...listing fields...
 *     ---
 *
 *     <long-form body — stored verbatim, may be HTML from the WYSIWYG editor>
 *
 * The frontmatter mirrors the DB "listing" columns; the body is the long-form
 * field that no longer lives in the database. Sections whose data is small or
 * hierarchical (skills, tasks) are stored as a single collection file whose
 * frontmatter carries an `items` list and whose body is empty.
 *
 * This service is deliberately storage-only: it knows nothing about Eloquent.
 * Callers map models <-> arrays and decide the section/slug.
 */
class MarkdownContentStore
{
    private string $basePath;

    public function __construct(?string $basePath = null)
    {
        $this->basePath = rtrim($basePath ?? config('content.path', base_path('content')), '/\\');
    }

    /** Absolute path to the content root. */
    public function basePath(): string
    {
        return $this->basePath;
    }

    /** Absolute path to a section directory (relative sub-paths allowed, e.g. "kanban/my-board"). */
    public function sectionPath(string $section): string
    {
        return $this->basePath.DIRECTORY_SEPARATOR.$this->safeSection($section);
    }

    /** Absolute path to a single item file. */
    public function itemPath(string $section, string $slug): string
    {
        return $this->sectionPath($section).DIRECTORY_SEPARATOR.$this->safeSlug($slug).'.md';
    }

    // ── Write ────────────────────────────────────────────────────────────────

    /**
     * Write (create or overwrite) one item file and return its absolute path.
     */
    public function writeItem(string $section, string $slug, array $frontmatter, string $body = ''): string
    {
        $path = $this->itemPath($section, $slug);
        $this->ensureDir(dirname($path));
        file_put_contents($path, $this->render($frontmatter, $body));

        return $path;
    }

    // ── Read ─────────────────────────────────────────────────────────────────

    /**
     * Read one item file. Returns ['slug' => , 'matter' => [], 'body' => ''] or null when missing.
     */
    public function readItem(string $section, string $slug): ?array
    {
        $path = $this->itemPath($section, $slug);

        if (! is_file($path)) {
            return null;
        }

        return $this->parseFile($path);
    }

    /**
     * Read every `*.md` file directly inside a section directory.
     *
     * @param  array<int,string>  $ignore  Basenames (without extension) to skip, e.g. ['board'].
     * @return array<int,array{slug:string,matter:array,body:string}>
     */
    public function allItems(string $section, array $ignore = []): array
    {
        $dir = $this->sectionPath($section);

        if (! is_dir($dir)) {
            return [];
        }

        $items = [];

        foreach (glob($dir.DIRECTORY_SEPARATOR.'*.md') ?: [] as $path) {
            $slug = pathinfo($path, PATHINFO_FILENAME);
            if (in_array($slug, $ignore, true)) {
                continue;
            }
            $items[] = $this->parseFile($path);
        }

        return $items;
    }

    /**
     * Names of immediate sub-directories of a section (e.g. kanban board folders).
     *
     * @return array<int,string>
     */
    public function listDirectories(string $section): array
    {
        $dir = $this->sectionPath($section);

        if (! is_dir($dir)) {
            return [];
        }

        return array_values(array_filter(
            scandir($dir) ?: [],
            fn ($entry) => $entry !== '.' && $entry !== '..' && is_dir($dir.DIRECTORY_SEPARATOR.$entry)
        ));
    }

    // ── Delete ───────────────────────────────────────────────────────────────

    /** Delete one item file. Returns true when a file was removed. */
    public function deleteItem(string $section, string $slug): bool
    {
        $path = $this->itemPath($section, $slug);

        if (is_file($path)) {
            unlink($path);

            return true;
        }

        return false;
    }

    /** Recursively delete a whole section directory (used when a kanban board is removed). */
    public function deleteDirectory(string $section): void
    {
        $this->rrmdir($this->sectionPath($section));
    }

    // ── Serialization primitives ───────────────────────────────────────────────

    /** Build the file contents from frontmatter + body. */
    public function render(array $frontmatter, string $body = ''): string
    {
        $yaml = Yaml::dump(
            $frontmatter,
            inline: 6,
            indent: 2,
            flags: Yaml::DUMP_MULTI_LINE_LITERAL_BLOCK
        );

        // Yaml::dump does not guarantee a trailing newline (e.g. when the last
        // value is a literal block), so normalise to exactly one before the fence.
        $yaml = rtrim($yaml, "\n")."\n";
        $body = trim($body);

        return "---\n".$yaml."---\n".($body === '' ? '' : "\n".$body."\n");
    }

    /**
     * Parse raw file contents into ['matter' => [], 'body' => ''].
     */
    public function parse(string $raw): array
    {
        $raw = str_replace("\r\n", "\n", $raw);
        $raw = preg_replace('/^\xEF\xBB\xBF/', '', $raw); // strip UTF-8 BOM

        if (preg_match('/\A---\s*\n(.*?)\n---\s*\n?(.*)\z/s', $raw, $m)) {
            $matter = Yaml::parse($m[1]) ?? [];

            return [
                'matter' => is_array($matter) ? $matter : [],
                'body' => trim($m[2]),
            ];
        }

        // No frontmatter fence — treat the whole file as body.
        return ['matter' => [], 'body' => trim($raw)];
    }

    // ── Internals ──────────────────────────────────────────────────────────────

    private function parseFile(string $path): array
    {
        $parsed = $this->parse((string) file_get_contents($path));
        $parsed['slug'] = pathinfo($path, PATHINFO_FILENAME);

        return $parsed;
    }

    private function ensureDir(string $dir): void
    {
        if (! is_dir($dir)) {
            mkdir($dir, 0o755, true);
        }
    }

    /** Strip path-traversal from a section sub-path while keeping nested folders. */
    private function safeSection(string $section): string
    {
        $parts = preg_split('#[/\\\\]+#', $section) ?: [];
        $clean = array_filter($parts, fn ($p) => $p !== '' && $p !== '.' && $p !== '..');

        return implode(DIRECTORY_SEPARATOR, $clean);
    }

    /** Reduce an arbitrary slug to a safe, traversal-free filename stem. */
    private function safeSlug(string $slug): string
    {
        $slug = basename(str_replace('\\', '/', $slug));
        $slug = preg_replace('/[^A-Za-z0-9\-_]/', '-', $slug) ?? '';
        $slug = trim($slug, '-');

        return $slug === '' ? 'item' : $slug;
    }

    private function rrmdir(string $dir): void
    {
        if (! is_dir($dir)) {
            return;
        }

        foreach (scandir($dir) ?: [] as $entry) {
            if ($entry === '.' || $entry === '..') {
                continue;
            }
            $path = $dir.DIRECTORY_SEPARATOR.$entry;
            is_dir($path) ? $this->rrmdir($path) : $this->retryFs('unlink', $path);
        }

        $this->retryFs('rmdir', $dir);
    }

    /**
     * Windows can briefly hold a handle on a just-deleted file (indexer/AV), making
     * a follow-up unlink/rmdir fail transiently. Retry a few times; surface a real
     * error only if it still fails.
     */
    private function retryFs(string $op, string $path): void
    {
        for ($attempt = 0; $attempt < 5; $attempt++) {
            if (@$op($path)) {
                return;
            }
            if ($op === 'unlink' ? ! file_exists($path) : ! is_dir($path)) {
                return; // already gone
            }
            usleep(50_000);
        }

        $op($path); // final attempt, unsuppressed so a genuine failure throws
    }
}
