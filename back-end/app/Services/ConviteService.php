<?php

namespace App\Services;

use App\Models\Convite;
use Illuminate\Support\Str;

class ConviteService
{
    public function gerarConvite(array $dados)
    {
        // Verifica se já existe um convite pendente para este email
        $conviteExistente = Convite::where('email', $dados['email'])
            ->where('status', 'pendente')
            ->first();

        if ($conviteExistente) {
            return $conviteExistente;
        }

        return Convite::create([
            'personal_id' => $dados['personal_id'],
            'email' => $dados['email'],
            'token' => Str::random(60),
            'status' => 'pendente'
        ]);
    }
}
