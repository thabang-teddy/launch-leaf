<?php

namespace App\Services;

/**
 * Defers a single full kanban re-export to the end of the request.
 *
 * Kanban mutations can touch many rows at once (a drag-reorder updates every
 * card in a column). Exporting on each individual model event would write files
 * from a half-updated database. Instead observers call schedule(); the actual
 * export runs once, after the response is sent, when the DB is fully consistent.
 */
class KanbanExportScheduler
{
    private bool $scheduled = false;

    public function __construct(private ContentSyncService $sync) {}

    public function schedule(): void
    {
        if ($this->scheduled) {
            return;
        }

        $this->scheduled = true;

        app()->terminating(function () {
            try {
                $this->sync->exportKanban();
            } catch (\Throwable $e) {
                report($e); // post-response export failure must not break the request
            } finally {
                $this->scheduled = false; // allow the next request to schedule again
            }
        });
    }
}
