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

        $tipoPerfil = $usuario->personal
            ? 'personal'
            : ($usuario->aluno ? 'aluno' : 'incompleto');

        $perfilId = $usuario->personal->id
            ?? $usuario->aluno->id
                ?? null;

        $resposta = [
            'usuario' => [
                'id' => $usuario->id,
                'nome' => $usuario->nome,
                'email' => $usuario->email,
                'email_verificado' => $usuario->hasVerifiedEmail(),
            ],
            'tipo_perfil' => $tipoPerfil,
            'perfil_id' => $perfilId,
        ];

        // Se for aluno, incluir dados do personal vinculado (se houver)
        if ($tipoPerfil === 'aluno' && $usuario->aluno) {
            $personalVinculado = $usuario->aluno
                ->personais()
                ->with('usuario')
                ->first();

            if ($personalVinculado) {
                $resposta['personal_vinculado'] = [
                    'id' => $personalVinculado->id,
                    'nome' => $personalVinculado->usuario->nome ?? null,
                    'email' => $personalVinculado->usuario->email ?? null,
                    'telefone' => $personalVinculado->telefone,
                    'genero' => $personalVinculado->genero,
                    'status_vinculo' => $personalVinculado->pivot->status,
                    'cadastrado_em' => $personalVinculado->created_at->format('Y-m-d H:i:s'),
                ];
            } else {
                $resposta['personal_vinculado'] = null;
            }
        }

        return $resposta;
    }
}
