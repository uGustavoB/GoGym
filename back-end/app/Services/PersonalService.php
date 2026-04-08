<?php

namespace App\Services;

use App\Models\Personal;
use Illuminate\Support\Facades\DB;

class PersonalService
{
    public function listar()
    {
        return Personal::with('usuario')->paginate(15);
    }

    public function buscarPorUsuarioId($usuario_id)
    {
        return Personal::with('usuario')->where('usuario_id', $usuario_id)->get();
    }

    public function criar(array $dados)
    {
        return DB::transaction(function () use ($dados) {
            return Personal::create($dados);
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
