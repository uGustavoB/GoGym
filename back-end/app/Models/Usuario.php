<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Usuario extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $table = 'usuarios';

    protected $fillable = [
        'nome',
        'email',
        'senha',
    ];

    protected $hidden = [
        'senha',
        'remember_token'
    ];

    protected function casts(): array
    {
        return [
            'data_verificacao_email' => 'datetime',
            'senha' => 'hashed',
        ];
    }

    public function getAuthPasswordName()
    {
        return 'senha';
    }

    public function personal()
    {
        return $this->hasOne(Personal::class);
    }

    public function aluno()
    {
        return $this->hasOne(Aluno::class);
    }
}
