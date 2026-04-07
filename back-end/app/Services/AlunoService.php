<?php

namespace App\Services;

use App\Models\Aluno;
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
            return Aluno::create($dados);
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
