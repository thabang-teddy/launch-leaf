<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Note;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NoteController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Dashboard/Notes/Index', [
            'notes' => Note::latest()->get(),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Dashboard/Notes/Create');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title'   => 'required|string|max:255',
            'content' => 'nullable|string',
        ]);

        Note::create($validated);

        return redirect()->route('dashboard.notes.index')->with('success', 'Note created.');
    }

    public function show(Note $note): RedirectResponse
    {
        return redirect()->route('dashboard.notes.edit', $note);
    }

    public function edit(Note $note): Response
    {
        return Inertia::render('Dashboard/Notes/Edit', ['note' => $note]);
    }

    public function update(Request $request, Note $note): RedirectResponse
    {
        $validated = $request->validate([
            'title'   => 'required|string|max:255',
            'content' => 'nullable|string',
        ]);

        $note->update($validated);

        return redirect()->route('dashboard.notes.index')->with('success', 'Note updated.');
    }

    public function destroy(Note $note): RedirectResponse
    {
        $note->delete();

        return redirect()->route('dashboard.notes.index')->with('success', 'Note deleted.');
    }
}
