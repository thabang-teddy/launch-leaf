<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Services\ContentSyncService;
use Illuminate\Http\RedirectResponse;

/**
 * Backs the per-section "Sync" buttons. Re-reads a section's markdown files and
 * rebuilds its database listing rows (files are authoritative). The section is
 * supplied via a route default so each section gets its own named route while
 * sharing one controller.
 */
class ContentSyncController extends Controller
{
    public function __construct(private ContentSyncService $sync) {}

    public function sync(string $section): RedirectResponse
    {
        if (! in_array($section, $this->sync->sections(), true)) {
            return back()->with('error', "Unknown content section [{$section}].");
        }

        try {
            $stats = $this->sync->syncSection($section);

            $synced = $stats['synced'] ?? ($stats['projects'] ?? 0);
            $deleted = $stats['deleted'] ?? 0;

            return back()->with('success', "Synced from files: {$synced} item(s) updated, {$deleted} removed.");
        } catch (\Throwable $e) {
            return back()->with('error', 'Sync failed: '.$e->getMessage());
        }
    }
}
