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
        Schema::create('logs_sessoes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('aluno_id')->constrained('alunos')->onDelete('cascade');
            $table->foreignId('rotina_sessao_id')->constrained('rotinas_sessoes')->onDelete('restrict');
            $table->date('data_execucao');
            $table->integer('esforco_percebido')->comment('PSE de 1 a 10');
            $table->integer('duracao_minutos');
            $table->text('observacoes_aluno')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('logs_sessoes');
    }
};
