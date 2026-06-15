<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KanbanCard extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'kanban_column_id', 'title', 'description', 'due_date', 'order',
    ];

    protected $casts = [
        'due_date' => 'date',
    ];

    public function column()
    {
        return $this->belongsTo(KanbanColumn::class, 'kanban_column_id');
    }
}
