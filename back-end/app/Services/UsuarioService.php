<?php

namespace App\Services;

use App\Models\Usuario;
use Illuminate\Auth\Events\Registered;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;

class UsuarioService
{
    public function criar(array $dados): Usuario
    {
        $usuario =  Usuario::create([
            'nome' => $dados['nome'],
            'email' => $dados['email'],
            'senha' => Hash::make($dados['senha']),
        ]);

        event(new Registered($usuario));

        return $usuario;
    }

    public function obterUsuarioLogado(Request $requisicao): array
    {
        $usuario = $requisicao->user()->load(['personal', 'aluno']);

        return [
            'usuario' => [
                'id' => $usuario->id,
                'nome' => $usuario->nome,
                'email' => $usuario->email,
                'email_verificado' => $usuario->hasVerifiedEmail(),
            ],
            'tipo_perfil' => $usuario->personal
                ? 'personal'
                : ($usuario->aluno ? 'aluno' : 'incompleto'),
            'perfil_id' => $usuario->personal->id
                ?? $usuario->aluno->id
                    ?? null,
        ];
    }
}
