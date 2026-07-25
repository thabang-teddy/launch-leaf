<?php

namespace App\Models;

use App\Traits\HasContentUuid;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Note extends Model
{
    use HasContentUuid, HasFactory;

    protected $fillable = ['uuid', 'title', 'content'];
}
