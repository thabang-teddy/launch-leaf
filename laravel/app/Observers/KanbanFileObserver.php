<?php

namespace App\Observers;

use App\Services\KanbanExportScheduler;
use Illuminate\Database\Eloquent\Model;

/**
 * Re-exports the kanban tree to markdown files whenever any board, project,
 * column or card changes. The work is deferred (see KanbanExportScheduler) so a
 * multi-row change produces exactly one export from the final DB state.
 */
class KanbanFileObserver
{
    public function __construct(private KanbanExportScheduler $scheduler) {}

    public function saved(Model $model): void
    {
        $this->scheduler->schedule();
    }

    public function deleted(Model $model): void
    {
        $this->scheduler->schedule();
    }
}
