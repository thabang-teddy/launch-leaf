<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Portfolio;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PortfolioController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Dashboard/Portfolio/Index', [
            'items' => Portfolio::orderBy('order')->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Dashboard/Portfolio/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'content'     => 'nullable|string',
            'image_path'  => 'nullable|string|max:255',
            'tech_stack'  => 'nullable|string',
            'live_url'    => 'nullable|url|max:255',
            'repo_url'    => 'nullable|url|max:255',
            'order'       => 'nullable|integer|min:0',
            'is_active'   => 'boolean',
        ]);

        $validated['slug']       = $this->uniqueSlug($validated['title']);
        $validated['tech_stack'] = $this->parseCsv($validated['tech_stack'] ?? '');
        $validated['order']      ??= 0;
        $validated['is_active']  ??= true;

        Portfolio::create($validated);

        return redirect()->route('dashboard.portfolio.index')->with('success', 'Portfolio item created.');
    }

    public function show(Portfolio $portfolio): RedirectResponse
    {
        return redirect()->route('dashboard.portfolio.edit', $portfolio);
    }

    public function edit(Portfolio $portfolio): Response
    {
        $item               = $portfolio->toArray();
        $item['tech_stack'] = implode(', ', $portfolio->tech_stack ?? []);

        return Inertia::render('Dashboard/Portfolio/Edit', ['item' => $item]);
    }

    public function update(Request $request, Portfolio $portfolio): RedirectResponse
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'content'     => 'nullable|string',
            'image_path'  => 'nullable|string|max:255',
            'tech_stack'  => 'nullable|string',
            'live_url'    => 'nullable|url|max:255',
            'repo_url'    => 'nullable|url|max:255',
            'order'       => 'nullable|integer|min:0',
            'is_active'   => 'boolean',
        ]);

        $validated['slug']       = $this->uniqueSlug($validated['title'], $portfolio->id);
        $validated['tech_stack'] = $this->parseCsv($validated['tech_stack'] ?? '');

        $portfolio->update($validated);

        return redirect()->route('dashboard.portfolio.index')->with('success', 'Portfolio item updated.');
    }

    public function destroy(Portfolio $portfolio): RedirectResponse
    {
        $portfolio->delete();

        return redirect()->route('dashboard.portfolio.index')->with('success', 'Portfolio item deleted.');
    }

    private function uniqueSlug(string $title, ?int $excludeId = null): string
    {
        $base = Str::slug($title);
        $slug = $base;
        $i    = 1;

        while (
            Portfolio::where('slug', $slug)
                ->when($excludeId, fn($q) => $q->where('id', '!=', $excludeId))
                ->exists()
        ) {
            $slug = "$base-$i";
            $i++;
        }

        return $slug;
    }

    private function parseCsv(string $raw): array
    {
        return array_values(array_filter(array_map('trim', explode(',', $raw))));
    }
}
