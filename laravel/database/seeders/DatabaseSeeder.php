<?php

namespace Database\Seeders;

use App\Models\Experience;
use App\Models\PersonalInfo;
use App\Models\Portfolio;
use App\Models\Skill;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Personal info (single record, id = 1) ─────────────────────────────
        // Avatar file must be placed at: storage/app/public/avatars/teddy.jpg
        PersonalInfo::firstOrCreate(
            ['id' => 1],
            [
                'name'        => 'Thabang Teddy Moreasetla',
                'headline'    => 'Web Developer',
                'bio'         => 'A South African based web developer that mainly works with C# and JavaScript. '
                    . 'The libraries I work in are React, Svelte and I have three years of work experience '
                    . 'working in ASP.Net core building PIMs (Product Information Management), Admins, and ecommerce websites.',
                'email'       => 'teddymorwasetla@gmail.com',
                'phone'       => '0786054005',
                'location'    => 'South Africa',
                'avatar_path' => 'avatars/teddy.jpg',
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

        // ── Work experience ────────────────────────────────────────────────────
        // Ported from ASP.NET ExperienceSeed — responsibilities folded into
        // the description as a second HTML section (no separate table in this schema).
        // Note: the original seed also had a Link field (https://www.jhnet.co.za)
        // which has no column here; add a 'link' column if needed later.
        $experiences = [
            [
                'title'       => 'ASP.NET Web Developer',
                'company'     => 'JHnet',
                'location'    => 'South Africa',
                'start_date'  => '2021-03-01',
                'end_date'    => null,
                'is_current'  => true,
                'type'        => 'work',
                'order'       => 1,
                'description' =>
                    '<ul class="mt-3">'
                    . '<li>Developed and maintained web applications using C#, ASP.NET MVC, and related technologies.</li>'
                    . '<li>Worked on admin and e-commerce websites for South Africa\'s leading distributor of branded promotional products.</li>'
                    . '<li>Designed and implemented Product Information Management (PIM) admin systems to streamline data handling and improve operational efficiency.</li>'
                    . '<li>Collaborated with cross-functional teams to gather requirements and deliver scalable software solutions.</li>'
                    . '<li>Optimized application performance and resolved technical issues to ensure seamless functionality.</li>'
                    . '<li>Contributed to the development of user-centric features and interfaces, enhancing overall user experience.</li>'
                    . '</ul>'
                    . '<h6 class="mt-4 mb-2 fw-bold">Key Projects</h6>'
                    . '<ul>'
                    . '<li><strong>E-commerce Website</strong> — Working on a team to develop a fully functional e-commerce platform for a leading distributor of branded promotional products.'
                    . ' <em>C#, ASP.NET MVC, SQL Server, JavaScript</em></li>'
                    . '<li><strong>Product Information Management (PIM) System</strong> — Implemented a PIM admin system to streamline data handling and improve operational efficiency.'
                    . ' <em>C#, ASP.NET MVC, SQL Server, RESTful APIs</em></li>'
                    . '<li><strong>Customer Portal</strong> — Built a user-friendly customer portal for managing orders, tracking shipments, and accessing support resources.'
                    . ' <em>C#, ASP.NET Core, React, SQL Server</em></li>'
                    . '</ul>',
            ],
        ];

        foreach ($experiences as $data) {
            $slug = Str::slug($data['title'] . '-' . $data['company']);

            Experience::firstOrCreate(
                ['slug' => $slug],
                array_merge($data, ['slug' => $slug])
            );
        }

        // ── Skills (frameworks & tools) ────────────────────────────────────────
        $skills = [
            [
                'name'        => 'ASP.NET Core',
                'icon'        => 'devicon-dot-net-plain colored',
                'description' => 'This is the framework I have been working with professionally since 2021, building PIMs (Product Information Management), admin portals, and e-commerce websites at JHnet.',
                'order'       => 1,
            ],
            [
                'name'        => 'Umbraco',
                'icon'        => 'fa-brands fa-umbraco text-primary',
                'description' => 'I have been using Umbraco as a frontend/content manager since 2021 and only started working on creating projects with it from 2024.',
                'order'       => 2,
            ],
            [
                'name'        => 'Flutter',
                'icon'        => 'devicon-flutter-plain colored',
                'description' => 'This is something I learnt through an online course and used to create the GIWU App — a cross-platform Bible application.',
                'order'       => 3,
            ],
            [
                'name'        => 'Laravel',
                'icon'        => 'devicon-laravel-plain colored',
                'description' => 'A self-taught framework I use to build personal projects, including this one. PHP was one of the first languages I learnt, and I rely on AI (Claude) heavily while working with it.',
                'order'       => 4,
            ],
            [
                'name'        => 'React.js',
                'icon'        => 'devicon-react-original colored',
                'description' => 'A framework I have been using since 2015 — self-taught and heavily used across my personal projects.',
                'order'       => 5,
            ],
        ];

        foreach ($skills as $data) {
            Skill::updateOrCreate(
                ['name' => $data['name']],
                $data
            );
        }
    }
}
