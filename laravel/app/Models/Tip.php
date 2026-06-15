<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tip extends Model
{
    use HasFactory;

    protected $fillable = [
        'title', 'slug', 'problem', 'solution', 'tags', 'is_published',
    ];

    protected $casts = [
        'tags'         => 'array',
        'is_published' => 'boolean',
    ];
}
