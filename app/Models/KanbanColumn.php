<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KanbanColumn extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = ['kanban_project_id', 'title', 'color', 'order'];

    public function project()
    {
        return $this->belongsTo(KanbanProject::class, 'kanban_project_id');
    }

    public function cards()
    {
        return $this->hasMany(KanbanCard::class)->orderBy('order');
    }
}
