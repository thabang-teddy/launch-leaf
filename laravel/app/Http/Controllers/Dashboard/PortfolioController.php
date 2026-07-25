<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Portfolio;
use App\Services\ContentSyncService;
use App\Traits\ResolvesOrder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PortfolioController extends Controller
{
    use ResolvesOrder;

    private const SECTION = 'portfolio';

    public function __construct(private ContentSyncService $sync) {}

    public function index(): Response
    {
        // Long-form `content` lives in the file, not the DB — attach it for editing.
        $items = Portfolio::orderBy('order')->get();
        $items->each(fn (Portfolio $item) => $item->content = $this->sync->readItemBody(self::SECTION, $item));

        return Inertia::render('Dashboard/Portfolio/Index', [
            'items' => $items,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Dashboard/Portfolio/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'content' => 'nullable|string',
            'image_path' => 'nullable|string|max:255',
            'tech_stack' => 'nullable|string',
            'live_url' => 'nullable|url|max:255',
            'repo_url' => 'nullable|url|max:255',
            'order' => 'nullable|integer|min:1',
            'is_active' => 'boolean',
        ]);

        $body = (string) ($validated['content'] ?? '');
        unset($validated['content']); // body is stored in the file, not the DB

        $validated['slug'] = $this->uniqueSlug($validated['title']);
        $validated['tech_stack'] = $this->parseCsv($validated['tech_stack'] ?? '');
        $validated['order'] = $this->nextAvailableOrder(Portfolio::class, $validated['order'] ?? 1);
        $validated['is_active'] ??= true;

        $portfolio = Portfolio::create($validated);
        $portfolio->content = $body;
        $this->sync->writeItemModel(self::SECTION, $portfolio);

        return redirect()->route('dashboard.portfolio.index')->with('success', 'Portfolio item created.');
    }

    public function show(Portfolio $portfolio): RedirectResponse
    {
        return redirect()->route('dashboard.portfolio.edit', $portfolio);
    }

    public function edit(Portfolio $portfolio): Response
    {
        $item = $portfolio->toArray();
        $item['tech_stack'] = implode(', ', $portfolio->tech_stack ?? []);

        return Inertia::render('Dashboard/Portfolio/Edit', ['item' => $item]);
    }

    public function update(Request $request, Portfolio $portfolio): RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'content' => 'nullable|string',
            'image_path' => 'nullable|string|max:255',
            'tech_stack' => 'nullable|string',
            'live_url' => 'nullable|url|max:255',
            'repo_url' => 'nullable|url|max:255',
            'order' => 'nullable|integer|min:1',
            'is_active' => 'boolean',
        ]);

        $previousSlug = $portfolio->slug;

        $body = (string) ($validated['content'] ?? '');
        unset($validated['content']); // body is stored in the file, not the DB

        $validated['slug'] = $this->uniqueSlug($validated['title'], $portfolio->id);
        $validated['tech_stack'] = $this->parseCsv($validated['tech_stack'] ?? '');

        if (isset($validated['order'])) {
            $validated['order'] = $this->nextAvailableOrder(Portfolio::class, $validated['order'], $portfolio->id);
        }

        $portfolio->update($validated);
        $portfolio->content = $body;
        $this->sync->writeItemModel(self::SECTION, $portfolio, $previousSlug);

        return redirect()->route('dashboard.portfolio.index')->with('success', 'Portfolio item updated.');
    }

    public function toggleActive(Portfolio $portfolio): RedirectResponse
    {
        $portfolio->update(['is_active' => ! $portfolio->is_active]);

        // Preserve the file body (this endpoint doesn't carry it) then rewrite frontmatter.
        $portfolio->content = $this->sync->readItemBody(self::SECTION, $portfolio);
        $this->sync->writeItemModel(self::SECTION, $portfolio);

        $state = $portfolio->is_active ? 'activated' : 'deactivated';

        return redirect()->route('dashboard.portfolio.index')->with('success', "Portfolio item {$state}.");
    }

    public function destroy(Portfolio $portfolio): RedirectResponse
    {
        $this->sync->deleteItemModel(self::SECTION, $portfolio);
        $portfolio->delete();

        return redirect()->route('dashboard.portfolio.index')->with('success', 'Portfolio item deleted.');
    }

    private function uniqueSlug(string $title, ?int $excludeId = null): string
    {
        $base = Str::slug($title);
        $slug = $base;
        $i = 1;

        while (
            Portfolio::where('slug', $slug)
                ->when($excludeId, fn ($q) => $q->where('id', '!=', $excludeId))
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
