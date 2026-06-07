<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\GitHubProject;
use App\Models\OtherAccount;
use App\Services\GitHubService;
use Illuminate\Http\RedirectResponse;

class GitHubSyncController extends Controller
{
    public function __construct(private GitHubService $github) {}

    public function syncProject(GitHubProject $project): RedirectResponse
    {
        try {
            $project->update($this->github->syncRepo($project->github_url));

            return back()->with('success', 'Project synced successfully.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Sync failed: ' . $e->getMessage());
        }
    }

    public function syncAccount(OtherAccount $account): RedirectResponse
    {
        try {
            $account->update($this->github->syncRepo($account->github_url));

            return back()->with('success', 'Account synced successfully.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Sync failed: ' . $e->getMessage());
        }
    }
}
