<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The GitHub Projects and Tips features were removed from the app.
     * Drop their tables. This migration is intentionally one-way — the
     * feature and its models no longer exist, so there is nothing to restore.
     */
    public function up(): void
    {
        Schema::dropIfExists('git_hub_projects');
        Schema::dropIfExists('tips');
    }

    public function down(): void
    {
        // No-op: the GitHub Projects and Tips features have been removed.
    }
};
