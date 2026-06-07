<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GitHubProject extends Model
{
    use HasFactory;

    protected $fillable = [
        'title', 'slug', 'description', 'github_url',
        'readme_content', 'file_tree', 'synced_at',
        'order', 'is_active',
    ];

    protected $casts = [
        'file_tree'  => 'array',
        'synced_at'  => 'datetime',
        'is_active'  => 'boolean',
    ];
}
