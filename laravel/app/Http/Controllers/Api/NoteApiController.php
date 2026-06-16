<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Note;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NoteApiController extends Controller
{
    public function index(): JsonResponse
    {
        $notes = Note::latest()->get(['id', 'title', 'content', 'created_at', 'updated_at']);

        return response()->json($notes);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'   => ['required', 'string', 'max:255'],
            'content' => ['nullable', 'string'],
        ]);

        $note = Note::create($data);

        return response()->json($note, 201);
    }

    public function update(Request $request, Note $note): JsonResponse
    {
        $data = $request->validate([
            'title'   => ['required', 'string', 'max:255'],
            'content' => ['nullable', 'string'],
        ]);

        $note->update($data);

        return response()->json($note);
    }

    public function destroy(Note $note): JsonResponse
    {
        $note->delete();

        return response()->json(null, 204);
    }
}
