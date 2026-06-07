<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Portfolio extends Model
{
    use HasFactory;

    protected $fillable = [
        'title', 'slug', 'description', 'content', 'image_path',
        'tech_stack', 'live_url', 'repo_url', 'order', 'is_active',
    ];

    protected $casts = [
        'tech_stack' => 'array',
        'is_active'  => 'boolean',
    ];
}
