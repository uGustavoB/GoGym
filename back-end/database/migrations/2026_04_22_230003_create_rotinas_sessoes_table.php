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
        Schema::create('rotinas_sessoes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ficha_treino_id')->constrained('fichas_treinos')->onDelete('cascade');
            $table->string('letra_nome');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rotinas_sessoes');
    }
};
