<?php

namespace App\Models;

use App\Traits\HasContentUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasContentUuid, HasFactory;

    protected $fillable = [
        'uuid', 'title', 'description', 'is_completed', 'completed_at', 'due_date', 'order',
    ];

    protected $casts = [
        'is_completed' => 'boolean',
        'completed_at' => 'datetime',
        'due_date' => 'date',
    ];
}
