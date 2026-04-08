<?php

namespace App\Services;

use App\Http\Resources\PersonalResource;
use App\Models\Personal;
use Illuminate\Support\Facades\DB;

class PersonalService
{
    public function __construct(
        private UsuarioService $usuarioService,
        private AuthService $authService
    ) {}

    public function listar()
    {
        return Personal::with('usuario')->paginate(15);
    }

    public function buscarPorUsuarioId($usuario_id)
    {
        return Personal::with('usuario')->where('usuario_id', $usuario_id)->get();
    }

    public function registrarComUsuario(array $dados)
    {
        return DB::transaction(function () use ($dados) {
            // Criar usuário
            $usuario = $this->usuarioService->criar($dados);

            // Criar personal
            $personal = Personal::create([
                'usuario_id' => $usuario->id,
                'telefone' => $dados['telefone'],
                'genero' => $dados['genero'],
            ]);

            // Gera token
            $token = $this->authService->gerarToken($usuario);

            return [
                'personal' => new PersonalResource($personal),
                'token' => $token
            ];
        });
    }

    public function atualizar(Personal $personal, array $dados)
    {
        return DB::transaction(function () use ($personal, $dados) {
            $personal->update($dados);
            return $personal;
        });
    }

    public function deletar(Personal $personal)
    {
//      Soft Delete
        return $personal->delete();
    }
}
