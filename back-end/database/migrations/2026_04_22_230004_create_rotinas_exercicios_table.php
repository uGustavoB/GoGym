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
        Schema::create('rotinas_exercicios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rotina_sessao_id')->constrained('rotinas_sessoes')->onDelete('cascade');
            $table->foreignId('exercicio_id')->constrained('exercicios')->onDelete('restrict');
            $table->integer('ordem');

            $table->enum('tipo_serie', [
                'aquecimento',
                'preparacao',
                'trabalho',
                'mista',
            ]);

            $table->integer('series');
            $table->string('repeticoes')->nullable();
            $table->integer('rir')->nullable();
            $table->string('carga_sugerida')->nullable();

            $table->enum('tecnica_avancada', [
                'nenhuma',
                'drop-set',
                'bi-set',
                'rest-pause',
                'cluster',
                'ponto_zero',
            ])->nullable();

            $table->integer('descanso_segundos')->nullable();
            $table->string('observacoes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('rotinas_exercicios');
    }
};
