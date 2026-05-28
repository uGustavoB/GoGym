<?php

namespace App\Traits;

use App\Models\Scopes\PersonalScope;

/**
 * Trait de isolamento multi-tenant.
 *
 * Aplica automaticamente um Global Scope que filtra registros
 * pelo personal_id do usuário autenticado.
 *
 * Para desabilitar o escopo em uma query específica:
 *   Model::withoutGlobalScope(PersonalScope::class)->get();
 */
trait BelongsToPersonal
{
    public static function bootBelongsToPersonal(): void
    {
        static::addGlobalScope(new PersonalScope());
    }
}
