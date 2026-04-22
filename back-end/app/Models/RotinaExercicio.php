<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RotinaExercicio extends Model
{
    use HasFactory;

    protected $table = 'rotinas_exercicios';

    protected $fillable = [
        'rotina_sessao_id',
        'exercicio_id',
        'ordem',
        'tipo_serie',
        'series',
        'repeticoes',
        'rir',
        'carga_sugerida',
        'tecnica_avancada',
        'descanso_segundos',
        'observacoes',
    ];

    protected $casts = [
        'ordem' => 'integer',
        'tipo_serie' => 'string',
        'series' => 'integer',
        'rir' => 'integer',
        'tecnica_avancada' => 'string',
        'descanso_segundos' => 'integer',
    ];

    public function rotinaSessao(): BelongsTo
    {
        return $this->belongsTo(RotinaSessao::class);
    }

    public function exercicio(): BelongsTo
    {
        return $this->belongsTo(Exercicio::class);
    }
}
