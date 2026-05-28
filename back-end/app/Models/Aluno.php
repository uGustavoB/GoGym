<?php

namespace App\Models;

use Database\Factories\AlunoFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Aluno extends Model
{
    /** @use HasFactory<AlunoFactory> */
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'usuario_id',
        'telefone',
        'genero',
        'data_nascimento',
        'peso',
        'altura',
        'ativo',
    ];

    protected $casts = [
        'ativo' => 'boolean',
        'peso' => 'float',
        'altura' => 'float',
    ];

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    public function personais(): BelongsToMany
    {
        return $this->belongsToMany(Personal::class, 'aluno_personal')
            ->withPivot('status')
            ->withTimestamps();
    }

    public function fichasTreinos(): HasMany
    {
        return $this->hasMany(FichaTreino::class);
    }

    public function logsSessoes(): HasMany
    {
        return $this->hasMany(LogSessao::class);
    }
}
