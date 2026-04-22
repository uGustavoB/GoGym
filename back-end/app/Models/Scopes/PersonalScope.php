<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class PersonalScope implements Scope
{
    /**
     * Aplica o escopo de isolamento multi-tenant por Personal.
     *
     * Para a tabela `exercicios`, permite exercícios globais (personal_id IS NULL)
     * além dos exercícios do personal autenticado.
     * Para as demais tabelas, filtra estritamente por personal_id.
     */
    public function apply(Builder $builder, Model $model): void
    {
        $user = auth()->user();

        if (! $user || ! $user->personal) {
            return;
        }

        $personalId = $user->personal->id;

        if ($model->getTable() === 'exercicios') {
            $builder->where(function (Builder $query) use ($personalId) {
                $query->whereNull('personal_id')
                    ->orWhere('personal_id', $personalId);
            });
        } else {
            $builder->where('personal_id', $personalId);
        }
    }
}
