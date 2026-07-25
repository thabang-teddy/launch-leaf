<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Drops the long-form columns whose content now lives only in the markdown files.
 *
 * Only the web-only sections are dropped here. `notes.content` and
 * `tasks.description` are intentionally left in place because the Flutter mobile
 * app syncs them directly through the database.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('portfolios', function (Blueprint $table) {
            $table->dropColumn('content');
        });

        Schema::table('experiences', function (Blueprint $table) {
            $table->dropColumn('description');
        });
    }

    public function down(): void
    {
        Schema::table('portfolios', function (Blueprint $table) {
            $table->longText('content')->nullable()->after('description');
        });

        Schema::table('experiences', function (Blueprint $table) {
            $table->longText('description')->nullable()->after('is_current');
        });
    }
};
