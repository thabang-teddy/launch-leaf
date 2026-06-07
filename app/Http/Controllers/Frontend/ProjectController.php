<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\GitHubProject;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Frontend/Projects/Index', [
            'projects' => GitHubProject::where('is_active', true)
                ->orderBy('order')
                ->get(['id', 'title', 'slug', 'description', 'github_url', 'synced_at']),
        ]);
    }

    public function show(string $slug): Response
    {
        $project = GitHubProject::where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        return Inertia::render('Frontend/Projects/Show', [
            'project' => $project,
        ]);
    }
}
