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
            $data = $this->github->syncRepo($project->github_url);
            $project->update($data);

            if ($data['readme_content'] === null && empty($data['file_tree'])) {
                return back()->with('error', 'Sync completed but no content was returned. The repository may be empty, private, or the GITHUB_TOKEN may be missing or invalid.');
            }

            return back()->with('success', 'Project synced successfully.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Sync failed: ' . $e->getMessage());
        }
    }

    public function syncAccount(OtherAccount $account): RedirectResponse
    {
        try {
            $data = $this->github->syncRepo($account->github_url);
            $account->update($data);

            if ($data['readme_content'] === null && empty($data['file_tree'])) {
                return back()->with('error', 'Sync completed but no content was returned. The repository may be empty, private, or the GITHUB_TOKEN may be missing or invalid.');
            }

            return back()->with('success', 'Account synced successfully.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Sync failed: ' . $e->getMessage());
        }
    }
}
