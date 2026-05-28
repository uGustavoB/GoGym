<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LogSerie extends Model
{
    use HasFactory;

    protected $table = 'logs_series';

    protected $fillable = [
        'log_sessao_id',
        'rotina_exercicio_id',
        'numero_serie',
        'repeticoes_realizadas',
        'carga_realizada',
    ];

    protected $casts = [
        'numero_serie' => 'integer',
        'repeticoes_realizadas' => 'integer',
    ];

    public function logSessao(): BelongsTo
    {
        return $this->belongsTo(LogSessao::class);
    }

    public function rotinaExercicio(): BelongsTo
    {
        return $this->belongsTo(RotinaExercicio::class);
    }
}
