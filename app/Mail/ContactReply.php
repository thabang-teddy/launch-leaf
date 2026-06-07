<?php

namespace App\Mail;

use App\Models\Contact;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ContactReply extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Contact $contact,
        public readonly string  $replyText,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            to:      $this->contact->email,
            subject: 'Re: ' . ($this->contact->subject ?? 'Your message'),
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'emails.contact-reply',
            with: [
                'name'      => $this->contact->name,
                'replyText' => $this->replyText,
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
