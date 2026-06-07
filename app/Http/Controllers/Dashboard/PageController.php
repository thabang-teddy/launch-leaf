<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Page;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PageController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Dashboard/Pages/Index', [
            'pages' => Page::latest()->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Dashboard/Pages/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title'        => 'required|string|max:255',
            'content'      => 'nullable|string',
            'is_published' => 'boolean',
        ]);

        $validated['slug']         = $this->uniqueSlug($validated['title']);
        $validated['is_published'] ??= false;

        Page::create($validated);

        return redirect()->route('dashboard.pages.index')->with('success', 'Page created.');
    }

    public function show(Page $page): RedirectResponse
    {
        return redirect()->route('dashboard.pages.edit', $page);
    }

    public function edit(Page $page): Response
    {
        return Inertia::render('Dashboard/Pages/Edit', ['page' => $page]);
    }

    public function update(Request $request, Page $page): RedirectResponse
    {
        $validated = $request->validate([
            'title'        => 'required|string|max:255',
            'content'      => 'nullable|string',
            'is_published' => 'boolean',
        ]);

        $validated['slug'] = $this->uniqueSlug($validated['title'], $page->id);

        $page->update($validated);

        return redirect()->route('dashboard.pages.index')->with('success', 'Page updated.');
    }

    public function destroy(Page $page): RedirectResponse
    {
        $page->delete();

        return redirect()->route('dashboard.pages.index')->with('success', 'Page deleted.');
    }

    private function uniqueSlug(string $title, ?int $excludeId = null): string
    {
        $base = Str::slug($title);
        $slug = $base;
        $i    = 1;

        while (
            Page::where('slug', $slug)
                ->when($excludeId, fn($q) => $q->where('id', '!=', $excludeId))
                ->exists()
        ) {
            $slug = "$base-$i";
            $i++;
        }

        return $slug;
    }
}
