<?php

namespace App\Console\Commands;

use App\Services\ContentSyncService;
use Illuminate\Console\Command;

class ContentSync extends Command
{
    protected $signature = 'content:sync {section? : One of portfolio, experience, skills, notes, tasks, kanban. Omit to sync all.}';

    protected $description = 'Sync content sections from markdown files back into the database listing index (files are authoritative).';

    public function handle(ContentSyncService $sync): int
    {
        $sections = $this->argument('section')
            ? [$this->argument('section')]
            : $sync->sections();

        foreach ($sections as $section) {
            $stats = $sync->syncSection($section);
            $this->line(sprintf('  %-12s %s', $section, json_encode($stats)));
        }

        $this->info('Sync complete.');

        return self::SUCCESS;
    }
}
