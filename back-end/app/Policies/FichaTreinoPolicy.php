<?php

namespace App\Policies;

use App\Models\FichaTreino;
use App\Models\Usuario;

class FichaTreinoPolicy
{
    /**
     * Qualquer personal ou aluno autenticado pode listar.
     * O Service aplica o filtro de escopo correto.
     */
    public function viewAny(Usuario $usuario): bool
    {
        return $usuario->personal !== null || $usuario->aluno !== null;
    }

    /**
     * Pode visualizar: personal dono OU aluno vinculado (independente de quem criou).
     */
    public function view(Usuario $usuario, FichaTreino $ficha): bool
    {
        return $this->podeAcessar($usuario, $ficha);
    }

    /**
     * Pode criar: qualquer personal ou aluno.
     */
    public function create(Usuario $usuario): bool
    {
        return $usuario->personal !== null || $usuario->aluno !== null;
    }

    /**
     * Pode editar: somente o criador.
     * - Personal: ficha com personal_id = seu id
     * - Aluno: ficha com aluno_id = seu id E personal_id IS NULL
     */
    public function update(Usuario $usuario, FichaTreino $ficha): bool
    {
        return $this->eDono($usuario, $ficha);
    }

    /**
     * Pode deletar: mesma regra que update.
     */
    public function delete(Usuario $usuario, FichaTreino $ficha): bool
    {
        return $this->eDono($usuario, $ficha);
    }

    private function podeAcessar(Usuario $usuario, FichaTreino $ficha): bool
    {
        if ($usuario->personal) {
            return $ficha->personal_id === $usuario->personal->id;
        }

        if ($usuario->aluno) {
            return $ficha->aluno_id === $usuario->aluno->id;
        }

        return false;
    }

    private function eDono(Usuario $usuario, FichaTreino $ficha): bool
    {
        if ($usuario->personal) {
            return $ficha->personal_id === $usuario->personal->id;
        }

        if ($usuario->aluno) {
            // Aluno só é dono de fichas que ele mesmo criou (personal_id nulo)
            return $ficha->aluno_id === $usuario->aluno->id
                && $ficha->personal_id === null;
        }

        return false;
    }
}
