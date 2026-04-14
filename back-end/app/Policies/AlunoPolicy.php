<?php

namespace App\Policies;

use App\Models\Aluno;
use App\Models\Usuario;

class AlunoPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(Usuario $usuario): bool
    {
        return $usuario->personal !== null || $usuario->aluno !== null;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(Usuario $usuario, Aluno $aluno): bool
    {
        if ($usuario->id === $aluno->usuario_id) {
            return true;
        }

        if ($usuario->personal) {
            return $usuario->personal->alunos()->where('aluno_id', $aluno->id)->exists();
        }

        return false;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(Usuario $usuario, Aluno $aluno): bool
    {
        if ($usuario->id === $aluno->usuario_id) {
            return true;
        }

        return $usuario->personal && $usuario->personal->alunos()->whereKey($aluno->id)->exists();
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(Usuario $usuario, Aluno $aluno): bool
    {
        return $usuario->id === $aluno->usuario_id;
    }
}
