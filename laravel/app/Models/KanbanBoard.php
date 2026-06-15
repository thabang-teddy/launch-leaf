<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class KanbanBoard extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = ['name', 'description', 'color', 'order'];

    /** Projects that belong to this board. */
    public function projects()
    {
        return $this->hasMany(KanbanProject::class)->orderBy('order');
    }
}
