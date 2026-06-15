<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\GitHubProject;
use App\Traits\ResolvesOrder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ProjectController extends Controller
{
    use ResolvesOrder;

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
            'content'     => 'nullable|string|max:10000',
            'github_url'  => 'required|url|max:255',
            'image'       => 'nullable|file|extensions:jpg,jpeg,png,webp,gif|max:2048',
            'order'       => 'nullable|integer|min:1',
            'is_active'   => 'boolean',
        ]);

        $validated['slug']      = $this->uniqueSlug($validated['title']);
        $validated['order']     = $this->nextAvailableOrder(GitHubProject::class, $validated['order'] ?? 1);
        $validated['is_active'] ??= true;

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('projects', 'public');
        }

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
            'content'     => 'nullable|string|max:10000',
            'github_url'  => 'required|url|max:255',
            'image'       => 'nullable|file|extensions:jpg,jpeg,png,webp,gif|max:2048',
            'order'       => 'nullable|integer|min:1',
            'is_active'   => 'boolean',
        ]);

        $validated['slug'] = $this->uniqueSlug($validated['title'], $project->id);

        if (isset($validated['order'])) {
            $validated['order'] = $this->nextAvailableOrder(GitHubProject::class, $validated['order'], $project->id);
        }

        if ($request->hasFile('image')) {
            if ($project->image) {
                Storage::disk('public')->delete($project->image);
            }
            $validated['image'] = $request->file('image')->store('projects', 'public');
        } else {
            unset($validated['image']);
        }

        $project->update($validated);

        return redirect()->route('dashboard.projects.index')->with('success', 'Project updated.');
    }

    public function destroy(GitHubProject $project): RedirectResponse
    {
        if ($project->image) {
            Storage::disk('public')->delete($project->image);
        }

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
