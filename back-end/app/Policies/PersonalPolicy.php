<?php

namespace App\Policies;

use App\Models\Personal;
use App\Models\Usuario;
use Illuminate\Auth\Access\Response;

class PersonalPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(Usuario $usuario): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(Usuario $usuario, Personal $personal): bool
    {
        return true;
    }


    /**
     * Determine whether the user can update the model.
     */
    public function update(Usuario $usuario, Personal $personal): bool
    {
        return $usuario->id === $personal->usuario_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(Usuario $usuario, Personal $personal): bool
    {
        return $usuario->id === $personal->usuario_id;
    }
}
