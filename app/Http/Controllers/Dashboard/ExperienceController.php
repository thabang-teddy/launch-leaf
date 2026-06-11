<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Experience;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ExperienceController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Dashboard/Experience/Index', [
            'items' => Experience::orderBy('order')->orderByDesc('start_date')->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Dashboard/Experience/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'company'     => 'required|string|max:255',
            'summary'     => 'nullable|string|max:500',
            'location'    => 'nullable|string|max:255',
            'start_date'  => 'required|date',
            'end_date'    => 'nullable|date|after_or_equal:start_date',
            'is_current'  => 'boolean',
            'description' => 'nullable|string',
            'type'        => 'required|in:work,education',
            'order'       => 'nullable|integer|min:0',
        ]);

        $validated['slug']       = $this->uniqueSlug($validated['title']);
        $validated['order']      ??= 0;
        $validated['is_current'] ??= false;

        Experience::create($validated);

        return redirect()->route('dashboard.experience.index')->with('success', 'Experience created.');
    }

    public function show(Experience $experience): RedirectResponse
    {
        return redirect()->route('dashboard.experience.edit', $experience);
    }

    public function edit(Experience $experience): Response
    {
        return Inertia::render('Dashboard/Experience/Edit', ['item' => $experience]);
    }

    public function update(Request $request, Experience $experience): RedirectResponse
    {
        $validated = $request->validate([
            'title'       => 'required|string|max:255',
            'company'     => 'required|string|max:255',
            'summary'     => 'nullable|string|max:500',
            'location'    => 'nullable|string|max:255',
            'start_date'  => 'required|date',
            'end_date'    => 'nullable|date|after_or_equal:start_date',
            'is_current'  => 'boolean',
            'description' => 'nullable|string',
            'type'        => 'required|in:work,education',
            'order'       => 'nullable|integer|min:0',
        ]);

        $validated['slug'] = $this->uniqueSlug($validated['title'], $experience->id);

        $experience->update($validated);

        return redirect()->route('dashboard.experience.index')->with('success', 'Experience updated.');
    }

    public function destroy(Experience $experience): RedirectResponse
    {
        $experience->delete();

        return redirect()->route('dashboard.experience.index')->with('success', 'Experience deleted.');
    }

    private function uniqueSlug(string $title, ?int $excludeId = null): string
    {
        $base = Str::slug($title);
        $slug = $base;
        $i    = 1;

        while (
            Experience::where('slug', $slug)
                ->when($excludeId, fn($q) => $q->where('id', '!=', $excludeId))
                ->exists()
        ) {
            $slug = "$base-$i";
            $i++;
        }

        return $slug;
    }
}
