<?php

namespace App\Models;

use App\Traits\BelongsToPersonal;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Exercicio extends Model
{
    use HasFactory, SoftDeletes, BelongsToPersonal;

    protected $table = 'exercicios';

    protected $fillable = [
        'personal_id',
        'nome',
        'tipo',
        'grupo_muscular',
        'video_url',
        'instrucoes',
    ];

    protected $casts = [
        'tipo' => 'string',
        'grupo_muscular' => 'string',
    ];

    public function personal(): BelongsTo
    {
        return $this->belongsTo(Personal::class);
    }

    public function rotinasExercicios(): HasMany
    {
        return $this->hasMany(RotinaExercicio::class);
    }
}
