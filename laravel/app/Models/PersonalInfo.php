<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class PersonalInfo extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'headline', 'bio', 'email', 'phone', 'location',
        'website_url', 'avatar_path', 'linkedin_url',
        'github_url', 'twitter_url', 'resume_url',
    ];

    protected $appends = ['avatar_url'];

    public function getAvatarUrlAttribute(): ?string
    {
        if (! $this->avatar_path) {
            return null;
        }
        return Storage::disk('uploads')->url($this->avatar_path);
    }
}
