<?php

namespace App\Models;

use App\Traits\HasContentUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Skill extends Model
{
    use HasContentUuid, HasFactory;

    protected $fillable = ['uuid', 'name', 'icon', 'description', 'order'];
}
