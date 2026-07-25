<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Content files path
    |--------------------------------------------------------------------------
    |
    | Root directory for the markdown files that back the content sections
    | (portfolio, experience, skills, notes, tasks, kanban). The database keeps
    | a listing index; these files are the source of truth for full content.
    |
    */

    'path' => env('CONTENT_PATH', base_path('content')),

];
