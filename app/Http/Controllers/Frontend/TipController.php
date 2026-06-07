<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Tip;
use Inertia\Inertia;
use Inertia\Response;

class TipController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Frontend/Tips/Index', [
            'tips' => Tip::where('is_published', true)
                ->latest()
                ->get(['id', 'title', 'slug', 'tags', 'created_at']),
        ]);
    }

    public function show(string $slug): Response
    {
        $tip = Tip::where('slug', $slug)
            ->where('is_published', true)
            ->firstOrFail();

        return Inertia::render('Frontend/Tips/Show', [
            'tip' => $tip,
        ]);
    }
}
