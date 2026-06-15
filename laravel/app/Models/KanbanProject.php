<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KanbanProject extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = ['kanban_board_id', 'name', 'description', 'color', 'order'];

    public function board()
    {
        return $this->belongsTo(KanbanBoard::class, 'kanban_board_id');
    }

    public function columns()
    {
        return $this->hasMany(KanbanColumn::class)->orderBy('order');
    }

    public function cards()
    {
        return $this->hasManyThrough(KanbanCard::class, KanbanColumn::class);
    }
}
