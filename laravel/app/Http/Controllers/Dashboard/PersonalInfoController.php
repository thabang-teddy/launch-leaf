<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\PersonalInfo;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PersonalInfoController extends Controller
{
    public function edit(): Response
    {
        return Inertia::render('Dashboard/PersonalInfo/Edit', [
            'info' => PersonalInfo::first() ?? new PersonalInfo(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'         => 'required|string|max:255',
            'headline'     => 'nullable|string|max:255',
            'bio'          => 'nullable|string',
            'email'        => 'nullable|email|max:255',
            'phone'        => 'nullable|string|max:50',
            'location'     => 'nullable|string|max:255',
            'website_url'  => 'nullable|url|max:255',
            'avatar'       => 'nullable|file|extensions:jpg,jpeg,png,webp|max:2048',
            'linkedin_url' => 'nullable|url|max:255',
            'github_url'   => 'nullable|url|max:255',
            'twitter_url'  => 'nullable|url|max:255',
            'resume_url'   => 'nullable|url|max:255',
        ]);

        $info = PersonalInfo::first() ?? new PersonalInfo();

        // Handle avatar file upload
        if ($request->hasFile('avatar')) {
            // Delete old avatar if it exists
            if ($info->avatar_path) {
                Storage::disk('public')->delete($info->avatar_path);
            }
            $file = $request->file('avatar');
            $filename = Str::random(40) . '.' . $file->getClientOriginalExtension();
            $file->storeAs('avatars', $filename, 'public');
            $validated['avatar_path'] = 'avatars/' . $filename;
        }

        unset($validated['avatar']);

        if ($info->exists) {
            $info->update($validated);
        } else {
            PersonalInfo::create($validated);
        }

        return back()->with('success', 'Personal info updated.');
    }
}
