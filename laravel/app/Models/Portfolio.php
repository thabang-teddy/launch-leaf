<?php

namespace App\Models;

use App\Traits\HasContentUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Portfolio extends Model
{
    use HasContentUuid, HasFactory;

    // `content` (long-form body) is stored in the markdown file, not the DB.
    protected $fillable = [
        'uuid', 'title', 'slug', 'description', 'image_path',
        'tech_stack', 'live_url', 'repo_url', 'order', 'is_active',
    ];

    protected $casts = [
        'tech_stack' => 'array',
        'is_active' => 'boolean',
    ];
}
