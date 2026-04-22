<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class RotinaSessao extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'rotinas_sessoes';

    protected $fillable = [
        'ficha_treino_id',
        'letra_nome',
    ];

    public function fichaTreino(): BelongsTo
    {
        return $this->belongsTo(FichaTreino::class);
    }

    public function exercicios(): HasMany
    {
        return $this->hasMany(RotinaExercicio::class);
    }
}
