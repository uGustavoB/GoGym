<?php

namespace App\Services;

use App\Models\Usuario;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;

class UsuarioService
{
    public function criar(array $dados): Usuario
    {
        return Usuario::create([
            'nome' => $dados['nome'],
            'email' => $dados['email'],
            'senha' => Hash::make($dados['senha']),
        ]);
    }

    public function obterUsuarioLogado(Request $requisicao): array
    {
        $usuario = $requisicao->user()->load(['personal', 'aluno']);

        return [
            'usuario' => [
                'id' => $usuario->id,
                'nome' => $usuario->nome,
                'email' => $usuario->email,
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
