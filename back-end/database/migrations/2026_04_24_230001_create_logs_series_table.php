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
        Schema::create('logs_series', function (Blueprint $table) {
            $table->id();
            $table->foreignId('log_sessao_id')->constrained('logs_sessoes')->onDelete('cascade');
            $table->foreignId('rotina_exercicio_id')->constrained('rotinas_exercicios')->onDelete('restrict');
            $table->integer('numero_serie');
            $table->integer('repeticoes_realizadas');
            $table->string('carga_realizada', 100);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('logs_series');
    }
};
