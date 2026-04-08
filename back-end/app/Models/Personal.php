<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
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

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }

    public function alunos()
    {
        return $this->belongsToMany(Aluno::class, 'aluno_personal')
            ->withPivot('status')
            ->withTimestamps();
    }

    public function convites()
    {
        return $this->hasMany(Convite::class);
    }
}
