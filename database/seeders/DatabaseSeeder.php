<?php

namespace Database\Seeders;

use App\Models\PersonalInfo;
use App\Models\Portfolio;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Personal info (single record, id = 1) ─────────────────────────────
        PersonalInfo::firstOrCreate(
            ['id' => 1],
            [
                'name'     => 'Teddy',
                'headline' => 'Full-Stack Developer',
            ]
        );

        // ── Dashboard owner ────────────────────────────────────────────────────
        $adminEmail    = env('ADMIN_EMAIL',    'admin@example.com');
        $adminPassword = env('ADMIN_PASSWORD', '');

        abort_if(empty($adminPassword), 1, 'ADMIN_PASSWORD is not set in .env — seeder aborted.');

        User::firstOrCreate(
            ['email' => $adminEmail],
            [
                'name'              => env('ADMIN_NAME', 'Admin'),
                'password'          => Hash::make($adminPassword),
                'email_verified_at' => now(),
            ]
        );

        // ── Portfolio items ────────────────────────────────────────────────────
        // Field mapping from original seed → this project's model:
        //   summary      → description  (short blurb shown on listing cards)
        //   description  → content      (full detail shown on the portfolio page)
        //   technologies → tech_stack   (json array)
        //   link         → repo_url     (GitHub links go here; set live_url separately when available)
        //   imageUrl     → image_path
        $portfolios = [
            [
                'title'       => 'Giwu Bible Website',
                'description' => 'An interactive web application that displays multiple versions of the Bible. '
                    . 'Built using React.js for the UI and Laravel 11 for the backend, providing a responsive and accessible platform.',
                'content'     => 'The application allows users to explore various Bible translations in one '
                    . 'centralised location with intuitive navigation and search functionality.',
                'tech_stack'  => ['React.js', 'Laravel 11'],
                'repo_url'    => 'https://github.com/yourusername/giwu-website',
                'image_path'  => null,
                'is_active'   => true,
                'order'       => 1,
            ],
            [
                'title'       => 'Giwu Bible Mobile App',
                'description' => 'A mobile-friendly application that enables users to access the Bible on their '
                    . 'smartphones. Built using Flutter, ensuring cross-platform compatibility and real-time updates.',
                'content'     => 'The app provides offline capabilities and multi-language support for easy '
                    . 'accessibility while reading the Bible.',
                'tech_stack'  => ['Flutter'],
                'repo_url'    => 'https://github.com/yourusername/giwu-mobile',
                'image_path'  => null,
                'is_active'   => true,
                'order'       => 2,
            ],
            [
                'title'       => 'Portfolio Website',
                'description' => 'A professional portfolio website showcasing my work and personal projects. '
                    . 'Built using React.js for the frontend and Laravel 11 for the backend.',
                'content'     => 'The website provides insights into my skills, projects, and experience '
                    . 'with full-stack web development.',
                'tech_stack'  => ['React.js', 'Laravel 11'],
                'live_url'    => null,
                'repo_url'    => null,
                'image_path'  => null,
                'is_active'   => true,
                'order'       => 3,
            ],
            [
                'title'       => 'Portfolio App',
                'description' => 'A mobile companion that provides notifications for contacts and updates to '
                    . 'the portfolio. Built using Flutter for cross-platform functionality.',
                'content'     => 'The app integrates with the web interface, allowing real-time updates and '
                    . 'notifications for contact management.',
                'tech_stack'  => ['Flutter'],
                'repo_url'    => 'https://github.com/yourusername/portfolio-app',
                'image_path'  => null,
                'is_active'   => true,
                'order'       => 4,
            ],
        ];

        foreach ($portfolios as $data) {
            $slug = Str::slug($data['title']);

            Portfolio::firstOrCreate(
                ['slug' => $slug],
                array_merge($data, ['slug' => $slug])
            );
        }
    }
}
