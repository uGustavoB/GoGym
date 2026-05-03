<?php

namespace App\Models;

use App\Traits\BelongsToPersonal;
use Illuminate\Database\Eloquent\Builder;
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

    // ── Relacionamentos ──

    public function personal(): BelongsTo
    {
        return $this->belongsTo(Personal::class);
    }

    public function rotinasExercicios(): HasMany
    {
        return $this->hasMany(RotinaExercicio::class);
    }

    // ── Escopos Locais ──

    /**
     * Busca por nome (case-insensitive, ignora acentos via collation do banco).
     */
    public function scopeSearch(Builder $query, ?string $nome): Builder
    {
        return $query->when($nome, fn (Builder $q, string $valor) =>
            $q->where('nome', 'LIKE', "%{$valor}%")
        );
    }

    /**
     * Filtra por tipo exato (superior, inferior, core, cardio, full_body).
     */
    public function scopeTipo(Builder $query, ?string $tipo): Builder
    {
        return $query->when($tipo, fn (Builder $q, string $valor) =>
            $q->where('tipo', $valor)
        );
    }

    /**
     * Filtra por grupo muscular exato.
     */
    public function scopeGrupoMuscular(Builder $query, ?string $grupoMuscular): Builder
    {
        return $query->when($grupoMuscular, fn (Builder $q, string $valor) =>
            $q->where('grupo_muscular', $valor)
        );
    }

    /**
     * Filtra exercícios globais (personal_id IS NULL) ou do personal (personal_id IS NOT NULL).
     */
    public function scopeGlobal(Builder $query, ?string $isGlobal): Builder
    {
        return $query->when($isGlobal !== null && $isGlobal !== '', function (Builder $q) use ($isGlobal) {
            $global = filter_var($isGlobal, FILTER_VALIDATE_BOOLEAN);

            return $global
                ? $q->whereNull('personal_id')
                : $q->whereNotNull('personal_id');
        });
    }
}
