<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('git_hub_projects', function (Blueprint $table) {
            $table->text('content')->nullable()->after('description');
            $table->string('image')->nullable()->after('content');
        });
    }

    public function down(): void
    {
        Schema::table('git_hub_projects', function (Blueprint $table) {
            $table->dropColumn(['content', 'image']);
        });
    }
};
