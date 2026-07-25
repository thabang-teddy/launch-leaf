<?php

namespace App\Traits;

use Illuminate\Support\Str;

/**
 * Auto-assigns a stable `uuid` on creation. The uuid is the match key used when
 * syncing markdown files back into the database, so every content row needs one.
 */
trait HasContentUuid
{
    protected static function bootHasContentUuid(): void
    {
        static::creating(function ($model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }
        });
    }
}
