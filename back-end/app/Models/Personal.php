<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Personal extends Model
{
    /** @use HasFactory<\Database\Factories\PersonalFactory> */
    use HasFactory, SoftDeletes;

    protected $table = 'personais';

    protected $fillable = [
        'usuario_id',
        'genero',
        'telefone',
    ];

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    public function alunos(): BelongsToMany
    {
        return $this->belongsToMany(Aluno::class, 'aluno_personal')
            ->withPivot('status')
            ->withTimestamps();
    }

    public function convites(): HasMany
    {
        return $this->hasMany(Convite::class);
    }

    public function exercicios(): HasMany
    {
        return $this->hasMany(Exercicio::class);
    }

    public function fichasTreinos(): HasMany
    {
        return $this->hasMany(FichaTreino::class);
    }
}
