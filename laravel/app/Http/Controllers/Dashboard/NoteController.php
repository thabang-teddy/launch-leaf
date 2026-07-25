<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Note;
use App\Services\ContentSyncService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NoteController extends Controller
{
    private const SECTION = 'notes';

    public function __construct(private ContentSyncService $sync) {}

    public function index(): Response
    {
        // Notes are also synced by the Flutter app via the DB, so `content` stays
        // in the DB (shared source of truth) and the markdown file mirrors it.
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
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
        ]);

        // Keep `content` in the DB (mobile sync relies on it) and mirror to the file.
        $note = Note::create($validated);
        $this->sync->writeItemModel(self::SECTION, $note);

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
            'title' => 'required|string|max:255',
            'content' => 'nullable|string',
        ]);

        $previousSlug = $this->sync->itemSlugFor(self::SECTION, $note);

        // Keep `content` in the DB (mobile sync relies on it) and mirror to the file.
        $note->update($validated);
        $this->sync->writeItemModel(self::SECTION, $note, $previousSlug);

        return redirect()->route('dashboard.notes.index')->with('success', 'Note updated.');
    }

    public function destroy(Note $note): RedirectResponse
    {
        $this->sync->deleteItemModel(self::SECTION, $note);
        $note->delete();

        return redirect()->route('dashboard.notes.index')->with('success', 'Note deleted.');
    }
}
