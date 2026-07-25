<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

/**
 * Adds a stable `uuid` match key to the content tables that are moving to a
 * markdown-file source of truth. The uuid (not the auto-increment id or the
 * slug) is what the file <-> DB sync matches on, so renames stay lossless.
 *
 * Kanban tables already use UUID primary keys, so they are intentionally
 * excluded here.
 */
return new class extends Migration
{
    /** Tables that gain a uuid column. */
    private array $tables = ['portfolios', 'experiences', 'skills', 'notes', 'tasks'];

    public function up(): void
    {
        foreach ($this->tables as $table) {
            if (! Schema::hasColumn($table, 'uuid')) {
                Schema::table($table, function (Blueprint $t) {
                    $t->uuid('uuid')->nullable()->after('id');
                });
            }

            // Backfill existing rows with a generated uuid.
            foreach (DB::table($table)->whereNull('uuid')->pluck('id') as $id) {
                DB::table($table)->where('id', $id)->update(['uuid' => (string) Str::uuid()]);
            }

            // Enforce uniqueness once every row has a value.
            Schema::table($table, function (Blueprint $t) {
                $t->unique('uuid');
            });
        }
    }

    public function down(): void
    {
        foreach ($this->tables as $table) {
            Schema::table($table, function (Blueprint $t) use ($table) {
                $t->dropUnique($table.'_uuid_unique');
                $t->dropColumn('uuid');
            });
        }
    }
};
