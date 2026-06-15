<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\OtherAccount;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Frontend/Accounts/Index', [
            'accounts' => OtherAccount::where('is_active', true)
                ->orderBy('order')
                ->get(['id', 'platform', 'username', 'title', 'slug', 'description']),
        ]);
    }

    public function show(string $slug): Response
    {
        $account = OtherAccount::where('slug', $slug)
            ->where('is_active', true)
            ->firstOrFail();

        return Inertia::render('Frontend/Accounts/Show', [
            'account' => $account,
        ]);
    }
}
