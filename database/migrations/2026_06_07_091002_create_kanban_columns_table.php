<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kanban_columns', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('kanban_project_id')
                ->nullable()
                ->constrained('kanban_projects')
                ->cascadeOnDelete();
            $table->string('title');
            $table->string('color')->nullable();
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kanban_columns');
    }
};
