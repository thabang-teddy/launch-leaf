<?php

namespace App\Http\Controllers\Frontend;

use App\Http\Controllers\Controller;
use App\Models\PersonalInfo;
use App\Models\Skill;
use Inertia\Inertia;
use Inertia\Response;

class PersonalInfoController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Frontend/About/Index', [
            'info'   => PersonalInfo::first(),
            'skills' => Skill::orderBy('order')->get(['id', 'name', 'icon', 'description']),
        ]);
    }
}
