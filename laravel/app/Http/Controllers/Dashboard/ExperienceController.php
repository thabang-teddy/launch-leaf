<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Experience;
use App\Services\ContentSyncService;
use App\Traits\ResolvesOrder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class ExperienceController extends Controller
{
    use ResolvesOrder;

    private const SECTION = 'experience';

    public function __construct(private ContentSyncService $sync) {}

    public function index(): Response
    {
        // Long-form `description` lives in the file, not the DB — attach it for editing.
        $items = Experience::orderBy('order')->orderByDesc('start_date')->get();
        $items->each(fn (Experience $item) => $item->description = $this->sync->readItemBody(self::SECTION, $item));

        return Inertia::render('Dashboard/Experience/Index', [
            'items' => $items,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Dashboard/Experience/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'company' => 'required|string|max:255',
            'summary' => 'nullable|string|max:500',
            'location' => 'nullable|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'is_current' => 'boolean',
            'description' => 'nullable|string',
            'type' => 'required|in:work,education',
            'order' => 'nullable|integer|min:1',
        ]);

        $body = (string) ($validated['description'] ?? '');
        unset($validated['description']); // body is stored in the file, not the DB

        $validated['slug'] = $this->uniqueSlug($validated['title']);
        $validated['order'] = $this->nextAvailableOrder(Experience::class, $validated['order'] ?? 1);
        $validated['is_current'] ??= false;

        $experience = Experience::create($validated);
        $experience->description = $body;
        $this->sync->writeItemModel(self::SECTION, $experience);

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
            'title' => 'required|string|max:255',
            'company' => 'required|string|max:255',
            'summary' => 'nullable|string|max:500',
            'location' => 'nullable|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'is_current' => 'boolean',
            'description' => 'nullable|string',
            'type' => 'required|in:work,education',
            'order' => 'nullable|integer|min:1',
        ]);

        $previousSlug = $experience->slug;

        $body = (string) ($validated['description'] ?? '');
        unset($validated['description']); // body is stored in the file, not the DB

        $validated['slug'] = $this->uniqueSlug($validated['title'], $experience->id);

        if (isset($validated['order'])) {
            $validated['order'] = $this->nextAvailableOrder(Experience::class, $validated['order'], $experience->id);
        }

        $experience->update($validated);
        $experience->description = $body;
        $this->sync->writeItemModel(self::SECTION, $experience, $previousSlug);

        return redirect()->route('dashboard.experience.index')->with('success', 'Experience updated.');
    }

    public function destroy(Experience $experience): RedirectResponse
    {
        $this->sync->deleteItemModel(self::SECTION, $experience);
        $experience->delete();

        return redirect()->route('dashboard.experience.index')->with('success', 'Experience deleted.');
    }

    private function uniqueSlug(string $title, ?int $excludeId = null): string
    {
        $base = Str::slug($title);
        $slug = $base;
        $i = 1;

        while (
            Experience::where('slug', $slug)
                ->when($excludeId, fn ($q) => $q->where('id', '!=', $excludeId))
                ->exists()
        ) {
            $slug = "$base-$i";
            $i++;
        }

        return $slug;
    }
}
