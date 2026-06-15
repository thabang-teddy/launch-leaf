<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('other_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('platform');           // e.g. GitHub, GitLab, npm
            $table->string('username');
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('github_url')->nullable();
            $table->longText('readme_content')->nullable();
            $table->json('file_tree')->nullable();
            $table->timestamp('synced_at')->nullable();
            $table->unsignedInteger('order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('other_accounts');
    }
};
