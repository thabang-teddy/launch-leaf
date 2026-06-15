<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class ContactController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Dashboard/Contact/Index', [
            'contacts' => Contact::latest()->get(),
        ]);
    }

    public function show(Contact $contact): Response
    {
        return Inertia::render('Dashboard/Contact/Show', ['contact' => $contact]);
    }

    public function reply(Request $request, Contact $contact): RedirectResponse
    {
        $validated = $request->validate([
            'reply' => 'required|string|max:5000',
        ]);

        Mail::raw($validated['reply'], function ($message) use ($contact) {
            $message->to($contact->email, $contact->name)
                    ->subject('Re: ' . ($contact->subject ?? 'Your message'));
        });

        $contact->update([
            'reply'      => $validated['reply'],
            'replied_at' => now(),
        ]);

        return back()->with('success', 'Reply sent to ' . $contact->email);
    }

    public function destroy(Contact $contact): RedirectResponse
    {
        $contact->delete();

        return redirect()->route('dashboard.contact.index')->with('success', 'Message deleted.');
    }
}
