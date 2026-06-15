<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\Portfolio;
use Inertia\Inertia;
use Inertia\Response;

class PortfolioController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Frontend/Portfolio/Index', [
            'items' => Portfolio::where('is_active', true)
                ->orderBy('order')
                ->get(['id', 'title', 'slug', 'description', 'image_path', 'tech_stack', 'live_url']),
        ]);
    }

    public function show(string $slug): Response
    {
        $item = Portfolio::where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        return Inertia::render('Frontend/Portfolio/Show', [
            'item' => $item,
        ]);
    }
}
