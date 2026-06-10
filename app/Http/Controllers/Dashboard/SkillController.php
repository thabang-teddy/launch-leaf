<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Skill;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SkillController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Dashboard/Skills/Index', [
            'items' => Skill::orderBy('order')->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Dashboard/Skills/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'icon'        => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'order'       => 'nullable|integer|min:0',
        ]);

        $validated['order'] ??= 0;

        Skill::create($validated);

        return redirect()->route('dashboard.skills.index')->with('success', 'Skill created.');
    }

    public function show(Skill $skill): RedirectResponse
    {
        return redirect()->route('dashboard.skills.edit', $skill);
    }

    public function edit(Skill $skill): Response
    {
        return Inertia::render('Dashboard/Skills/Edit', ['item' => $skill]);
    }

    public function update(Request $request, Skill $skill): RedirectResponse
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'icon'        => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'order'       => 'nullable|integer|min:0',
        ]);

        $skill->update($validated);

        return redirect()->route('dashboard.skills.index')->with('success', 'Skill updated.');
    }

    public function destroy(Skill $skill): RedirectResponse
    {
        $skill->delete();

        return redirect()->route('dashboard.skills.index')->with('success', 'Skill deleted.');
    }
}
