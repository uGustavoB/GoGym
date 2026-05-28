<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LogSessao extends Model
{
    use HasFactory;

    protected $table = 'logs_sessoes';

    protected $fillable = [
        'aluno_id',
        'rotina_sessao_id',
        'data_execucao',
        'esforco_percebido',
        'duracao_minutos',
        'observacoes_aluno',
    ];

    protected $casts = [
        'data_execucao' => 'date',
        'esforco_percebido' => 'integer',
        'duracao_minutos' => 'integer',
    ];

    public function aluno(): BelongsTo
    {
        return $this->belongsTo(Aluno::class);
    }

    public function rotinaSessao(): BelongsTo
    {
        return $this->belongsTo(RotinaSessao::class);
    }

    public function logSeries(): HasMany
    {
        return $this->hasMany(LogSerie::class);
    }
}
