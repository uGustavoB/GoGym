<?php

namespace App\Models;

use App\Notifications\VerificarEmailNotification;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Usuario extends Authenticatable implements MustVerifyEmail
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

    public function hasVerifiedEmail(): bool
    {
        return $this->data_verificacao_email !== null;
    }

    public function markEmailAsVerified(): bool
    {
        return $this->forceFill([
            'data_verificacao_email' => $this->freshTimestamp(),
        ])->save();
    }

    public function sendEmailVerificationNotification(): void
    {
        $this->notify(new VerificarEmailNotification());
    }

    public function getEmailForVerification(): string
    {
        return $this->email;
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
