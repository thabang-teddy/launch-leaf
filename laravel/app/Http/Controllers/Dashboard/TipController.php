<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Tip;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class TipController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Dashboard/Tips/Index', [
            'tips' => Tip::latest()->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Dashboard/Tips/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title'        => 'required|string|max:255',
            'problem'      => 'required|string',
            'solution'     => 'required|string',
            'tags'         => 'nullable|string',
            'is_published' => 'boolean',
        ]);

        $validated['slug']         = $this->uniqueSlug($validated['title']);
        $validated['tags']         = $this->parseCsv($validated['tags'] ?? '');
        $validated['is_published'] ??= false;

        Tip::create($validated);

        return redirect()->route('dashboard.tips.index')->with('success', 'Tip created.');
    }

    public function show(Tip $tip): RedirectResponse
    {
        return redirect()->route('dashboard.tips.edit', $tip);
    }

    public function edit(Tip $tip): Response
    {
        $item         = $tip->toArray();
        $item['tags'] = implode(', ', $tip->tags ?? []);

        return Inertia::render('Dashboard/Tips/Edit', ['tip' => $item]);
    }

    public function update(Request $request, Tip $tip): RedirectResponse
    {
        $validated = $request->validate([
            'title'        => 'required|string|max:255',
            'problem'      => 'required|string',
            'solution'     => 'required|string',
            'tags'         => 'nullable|string',
            'is_published' => 'boolean',
        ]);

        $validated['slug'] = $this->uniqueSlug($validated['title'], $tip->id);
        $validated['tags'] = $this->parseCsv($validated['tags'] ?? '');

        $tip->update($validated);

        return redirect()->route('dashboard.tips.index')->with('success', 'Tip updated.');
    }

    public function destroy(Tip $tip): RedirectResponse
    {
        $tip->delete();

        return redirect()->route('dashboard.tips.index')->with('success', 'Tip deleted.');
    }

    private function uniqueSlug(string $title, ?int $excludeId = null): string
    {
        $base = Str::slug($title);
        $slug = $base;
        $i    = 1;

        while (
            Tip::where('slug', $slug)
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
