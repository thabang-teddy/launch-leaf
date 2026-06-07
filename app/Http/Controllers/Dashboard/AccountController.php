<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\OtherAccount;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Dashboard/Accounts/Index', [
            'accounts' => OtherAccount::orderBy('order')->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Dashboard/Accounts/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'platform'    => 'required|string|max:100',
            'username'    => 'required|string|max:255',
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'github_url'  => 'nullable|url|max:255',
            'order'       => 'nullable|integer|min:0',
            'is_active'   => 'boolean',
        ]);

        $validated['slug']      = $this->uniqueSlug($validated['title']);
        $validated['order']     ??= 0;
        $validated['is_active'] ??= true;

        OtherAccount::create($validated);

        return redirect()->route('dashboard.accounts.index')->with('success', 'Account created.');
    }

    public function show(OtherAccount $account): RedirectResponse
    {
        return redirect()->route('dashboard.accounts.edit', $account);
    }

    public function edit(OtherAccount $account): Response
    {
        return Inertia::render('Dashboard/Accounts/Edit', ['account' => $account]);
    }

    public function update(Request $request, OtherAccount $account): RedirectResponse
    {
        $validated = $request->validate([
            'platform'    => 'required|string|max:100',
            'username'    => 'required|string|max:255',
            'title'       => 'required|string|max:255',
            'description' => 'nullable|string',
            'github_url'  => 'nullable|url|max:255',
            'order'       => 'nullable|integer|min:0',
            'is_active'   => 'boolean',
        ]);

        $validated['slug'] = $this->uniqueSlug($validated['title'], $account->id);

        $account->update($validated);

        return redirect()->route('dashboard.accounts.index')->with('success', 'Account updated.');
    }

    public function destroy(OtherAccount $account): RedirectResponse
    {
        $account->delete();

        return redirect()->route('dashboard.accounts.index')->with('success', 'Account deleted.');
    }

    private function uniqueSlug(string $title, ?int $excludeId = null): string
    {
        $base = Str::slug($title);
        $slug = $base;
        $i    = 1;

        while (
            OtherAccount::where('slug', $slug)
                ->when($excludeId, fn($q) => $q->where('id', '!=', $excludeId))
                ->exists()
        ) {
            $slug = "$base-$i";
            $i++;
        }

        return $slug;
    }
}
