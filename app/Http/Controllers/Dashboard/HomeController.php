<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\Experience;
use App\Models\GitHubProject;
use App\Models\KanbanCard;
use App\Models\KanbanColumn;
use App\Models\KanbanProject;
use App\Models\Note;
use App\Models\OtherAccount;
use App\Models\Page;
use App\Models\Portfolio;
use App\Models\Task;
use App\Models\Tip;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Dashboard/Home', [
            'stats' => [
                'projects'         => GitHubProject::count(),
                'accounts'         => OtherAccount::count(),
                'portfolio'        => Portfolio::count(),
                'experience'       => Experience::count(),
                'tips'             => Tip::count(),
                'tips_published'   => Tip::where('is_published', true)->count(),
                'pages'            => Page::count(),
                'notes'            => Note::count(),
                'tasks'            => Task::count(),
                'tasks_done'       => Task::where('is_completed', true)->count(),
                'tasks_pending'    => Task::where('is_completed', false)->count(),
                'kanban_projects'  => KanbanProject::count(),
                'kanban_cards'     => KanbanCard::count(),
                'kanban_columns'   => KanbanColumn::count(),
                'contacts'         => Contact::count(),
                'contacts_pending' => Contact::whereNull('reply')->count(),
            ],
        ]);
    }
}
