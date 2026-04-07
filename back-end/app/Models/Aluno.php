<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Aluno extends Model
{
    /** @use HasFactory<\Database\Factories\AlunoFactory> */
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

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'usuario_id');
    }
}
