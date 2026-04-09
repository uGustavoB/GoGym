<?php

namespace App\Policies;

use App\Models\Convite;
use App\Models\Usuario;
use Illuminate\Auth\Access\Response;

class ConvitePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(Usuario $usuario): bool
    {
        return $usuario->personal !== null;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(Usuario $usuario, Convite $convite): bool
    {
        return $usuario->personal && $usuario->personal->id === $convite->personal_id;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(Usuario $usuario): bool
    {
        return $usuario->personal !== null;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(Usuario $usuario, Convite $convite): bool
    {
        return $usuario->personal && $usuario->personal->id === $convite->personal_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(Usuario $usuario, Convite $convite): bool
    {
        return $usuario->personal && $usuario->personal->id === $convite->personal_id;
    }
}
