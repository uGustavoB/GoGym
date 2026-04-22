<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FichaSemana extends Model
{
    use HasFactory;

    protected $table = 'ficha_semanas';

    protected $fillable = [
        'ficha_treino_id',
        'numero_semana',
        'descricao_fase',
        'repeticoes_alvo',
        'rir_alvo',
        'intensidade_carga',
    ];

    protected $casts = [
        'numero_semana' => 'integer',
        'rir_alvo' => 'integer',
    ];

    public function fichaTreino(): BelongsTo
    {
        return $this->belongsTo(FichaTreino::class);
    }
}
