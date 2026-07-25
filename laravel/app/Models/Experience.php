<?php

namespace App\Models;

use App\Traits\HasContentUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Experience extends Model
{
    use HasContentUuid, HasFactory;

    // `description` (long-form body) is stored in the markdown file, not the DB.
    protected $fillable = [
        'uuid', 'title', 'slug', 'company', 'summary', 'location',
        'start_date', 'end_date', 'is_current',
        'type', 'order',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_current' => 'boolean',
    ];
}
