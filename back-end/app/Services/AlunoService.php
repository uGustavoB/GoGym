<?php

namespace App\Services;

use App\Models\Aluno;
use App\Models\Convite;
use Illuminate\Support\Facades\DB;

class AlunoService
{
    public function listar()
    {
        return Aluno::with('usuario')->paginate(15);
    }

    public function criar(array $dados)
    {
        return DB::transaction(function () use ($dados) {
            $tokenConvite = $dados['token_convite'] ?? null;
            unset($dados['token_convite']);

            $aluno = Aluno::create($dados);

            // Vincular com personal
            if ($tokenConvite) {
                $this->vincularPersonal($aluno, $tokenConvite);
            }

            return $aluno;
        });
    }

    public function vincularPersonal(Aluno $aluno, string $tokenConvite)
    {
        $convite = Convite::where('token', $tokenConvite)
            ->where('status', 'pendente')
            ->first();

        if ($convite) {
            $aluno->personais()->attach($convite->personal_id, ['status' => 'ativo']);

            // Invalida o convite
            $convite->update(['status' => 'aceito']);
        } else {
            throw new \Exception('Token de convite inválido ou já utilizado.');
        }
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
