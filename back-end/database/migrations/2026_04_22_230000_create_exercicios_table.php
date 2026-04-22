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
        Schema::create('exercicios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('personal_id')->nullable()->constrained('personais')->nullOnDelete();
            $table->string('nome');

            $table->enum('tipo', [
                'superior',
                'inferior',
                'core',
                'cardio',
                'full_body',
            ]);

            $table->enum('grupo_muscular', [
                'peitoral',
                'costas',
                'ombros',
                'biceps',
                'triceps',
                'quadriceps',
                'posterior_coxa',
                'gluteos',
                'panturrilhas',
                'abdomen',
                'outro',
            ]);

            $table->string('video_url')->nullable();
            $table->text('instrucoes')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('exercicios');
    }
};
