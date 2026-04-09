<?php

namespace App\Services;

use App\Http\Resources\AlunoResource;
use App\Models\Aluno;
use Illuminate\Support\Facades\DB;

class AlunoService
{
    public function __construct(
        private UsuarioService $usuarioService,
        private AuthService $authService,
        private ConviteService $conviteService
    ) {}

    public function listar($usuarioLogado)
    {
        $personal = $usuarioLogado->personal;

        // Se for personal, retornar apenas alunos dele.
        if ($personal) {
            return $personal->alunos()->with('usuario')->paginate(15);
        }

        // Se for aluno, retornar apenas ele mesmo.
        $aluno = $usuarioLogado->aluno;
        if ($aluno) {
            return Aluno::where('id', $aluno->id)->with('usuario')->paginate(15);
        }

        // Retorna vazio caso o usuário não tenha perfil
        return Aluno::whereRaw('1 = 0')->paginate(1);
    }

    public function registrarComUsuario(array $dados)
    {
        return DB::transaction(function () use ($dados) {
            // Criar usuario
            $usuario = $this->usuarioService->criar($dados);

            // Obter token de convite
            $tokenConvite = $dados['token_convite'] ?? null;
            unset($dados['nome'], $dados['email'], $dados['senha'], $dados['token_convite']);

            // Criar aluno
            $dados['usuario_id'] = $usuario->id;
            $aluno = Aluno::create($dados);

            // Vincular com personal
            $this->conviteService->vincularAlunoPorToken($tokenConvite, $aluno);

            // Gerar token
            $token = $this->authService->gerarToken($usuario);

            return [
                'aluno' => new AlunoResource($aluno),
                'token' => $token
            ];
        });
    }

    public function atualizar(Aluno $aluno, array $dados)
    {
        return DB::transaction(function () use ($aluno, $dados) {
            $aluno->update($dados);
            return $aluno;
        });
    }

    public function deletar(Aluno $aluno)
    {
        return DB::transaction(function () use ($aluno) {
            $aluno->ativo = false;
            $aluno->save();
            $aluno->delete();
        });
    }
}
