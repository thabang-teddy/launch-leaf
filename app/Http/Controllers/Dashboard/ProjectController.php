<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\GitHubProject;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Dashboard/Projects/Index', [
            'projects' => GitHubProject::orderBy('order')->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Dashboard/Projects/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'github_url'  => 'required|url|max:255',
            'order'       => 'nullable|integer|min:0',
            'is_active'   => 'boolean',
        ]);

        $validated['slug']      = $this->uniqueSlug($validated['title']);
        $validated['order']     ??= 0;
        $validated['is_active'] ??= true;

        GitHubProject::create($validated);

        return redirect()->route('dashboard.projects.index')->with('success', 'Project created.');
    }

    public function show(GitHubProject $project): RedirectResponse
    {
        return redirect()->route('dashboard.projects.edit', $project);
    }

    public function edit(GitHubProject $project): Response
    {
        return Inertia::render('Dashboard/Projects/Edit', ['project' => $project]);
    }

    public function update(Request $request, GitHubProject $project): RedirectResponse
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'github_url'  => 'required|url|max:255',
            'order'       => 'nullable|integer|min:0',
            'is_active'   => 'boolean',
        ]);

        $validated['slug'] = $this->uniqueSlug($validated['title'], $project->id);

        $project->update($validated);

        return redirect()->route('dashboard.projects.index')->with('success', 'Project updated.');
    }

    public function destroy(GitHubProject $project): RedirectResponse
    {
        $project->delete();

        return redirect()->route('dashboard.projects.index')->with('success', 'Project deleted.');
    }

    private function uniqueSlug(string $title, ?int $excludeId = null): string
    {
        $base = Str::slug($title);
        $slug = $base;
        $i    = 1;

        while (
            GitHubProject::where('slug', $slug)
                ->when($excludeId, fn($q) => $q->where('id', '!=', $excludeId))
                ->exists()
        ) {
            $slug = "$base-$i";
            $i++;
        }

        return $slug;
    }
}
