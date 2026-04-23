<?php

namespace App\Services;

use App\Models\Exercicio;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class ExercicioService
{
    public function listar(): LengthAwarePaginator
    {
        return Exercicio::orderBy('nome')->paginate(30);
    }

    public function criar(array $dados, int $personalId): Exercicio
    {
        $dados['personal_id'] = $personalId;

        return Exercicio::create($dados);
    }

    public function atualizar(Exercicio $exercicio, array $dados, int $personalId): Exercicio
    {
        $this->autorizarProprietario($exercicio, $personalId);

        $exercicio->update($dados);

        return $exercicio;
    }

    public function deletar(Exercicio $exercicio, int $personalId): void
    {
        $this->autorizarProprietario($exercicio, $personalId);

        $exercicio->delete();
    }

    private function autorizarProprietario(Exercicio $exercicio, int $personalId): void
    {
        if ($exercicio->personal_id !== $personalId) {
            throw new AccessDeniedHttpException('Você não tem permissão para modificar este exercício.');
        }
    }
}
