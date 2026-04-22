<?php

namespace App\Models;

use App\Traits\BelongsToPersonal;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class FichaTreino extends Model
{
    use HasFactory, SoftDeletes, BelongsToPersonal;

    protected $table = 'fichas_treinos';

    protected $fillable = [
        'personal_id',
        'aluno_id',
        'nome',
        'objetivo',
        'observacoes_gerais',
        'data_inicio',
        'data_vencimento',
    ];

    protected $casts = [
        'data_inicio' => 'date',
        'data_vencimento' => 'date',
    ];

    public function personal(): BelongsTo
    {
        return $this->belongsTo(Personal::class);
    }

    public function aluno(): BelongsTo
    {
        return $this->belongsTo(Aluno::class);
    }

    public function semanas(): HasMany
    {
        return $this->hasMany(FichaSemana::class);
    }

    public function rotinas(): HasMany
    {
        return $this->hasMany(RotinaSessao::class);
    }
}
