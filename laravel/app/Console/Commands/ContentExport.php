<?php

namespace App\Console\Commands;

use App\Services\ContentSyncService;
use Illuminate\Console\Command;

class ContentExport extends Command
{
    protected $signature = 'content:export';

    protected $description = 'Export all content sections (portfolio, experience, skills, notes, tasks, kanban) from the database to markdown files.';

    public function handle(ContentSyncService $sync): int
    {
        $this->info('Exporting content to markdown files…');

        $counts = $sync->exportAll();

        foreach ($counts as $section => $count) {
            $this->line(sprintf('  %-12s %d', $section, $count));
        }

        $this->info('Done.');

        return self::SUCCESS;
    }
}
