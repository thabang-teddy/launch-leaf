<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Experience;
use Inertia\Inertia;
use Inertia\Response;

class ExperienceController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Frontend/Experience/Index', [
            'experiences' => Experience::orderBy('order')
                ->orderByDesc('start_date')
                ->get(['id', 'title', 'slug', 'company', 'location', 'start_date', 'end_date', 'is_current', 'type']),
        ]);
    }

    public function show(string $slug): Response
    {
        $experience = Experience::where('slug', $slug)->firstOrFail();

        return Inertia::render('Frontend/Experience/Show', [
            'experience' => $experience,
        ]);
    }
}
