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
        Schema::create('fichas_treinos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('personal_id')->constrained('personais')->onDelete('cascade');
            $table->foreignId('aluno_id')->constrained('alunos')->onDelete('cascade');
            $table->string('nome');
            $table->string('objetivo')->nullable();
            $table->text('observacoes_gerais')->nullable();
            $table->date('data_inicio');
            $table->date('data_vencimento')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('fichas_treinos');
    }
};
