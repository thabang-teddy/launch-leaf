<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\ContactReply;
use App\Models\Contact;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Mail;

class ContactApiController extends Controller
{
    public function index(): JsonResponse
    {
        $contacts = Contact::latest()->get([
            'id', 'name', 'email', 'subject', 'message',
            'reply', 'replied_at', 'created_at', 'updated_at',
        ]);

        return response()->json($contacts);
    }

    public function destroy(Contact $contact): JsonResponse
    {
        $contact->delete();

        return response()->json(null, 204);
    }

    public function reply(Request $request, Contact $contact): JsonResponse
    {
        $data = $request->validate([
            'reply' => ['required', 'string'],
        ]);

        $contact->update([
            'reply'      => $data['reply'],
            'replied_at' => Carbon::now(),
        ]);

        try {
            Mail::send(new ContactReply($contact, $data['reply']));
        } catch (\Throwable $e) {
            // Email is best-effort; the reply is already saved.
        }

        return response()->json($contact);
    }
}
