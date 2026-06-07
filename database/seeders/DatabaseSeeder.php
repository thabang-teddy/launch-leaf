<?php

namespace Database\Seeders;

use App\Models\PersonalInfo;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Ensure exactly one PersonalInfo row exists (the CV / about page)
        PersonalInfo::firstOrCreate(
            ['id' => 1],
            ['name' => 'Your Name', 'headline' => 'Full-stack developer']
        );

        // Create the dashboard owner account if it doesn't exist yet.
        // Change the email/password before running in production.
        User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name'     => 'Admin',
                'password' => Hash::make('password'),
            ]
        );
    }
}
