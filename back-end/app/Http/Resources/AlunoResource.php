<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AlunoResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'usuario_id' => $this->usuario_id,
            'telefone' => $this->telefone,
            'genero' => $this->genero,
            'dados_fisicos' => [
                'peso' => $this->peso,
                'altura' => $this->altura,
                'data_nascimento' => $this->data_nascimento,
            ],
            'ativo' => $this->ativo,
            'cadastrado_em' => $this->created_at->format('Y-m-d H:i:s'),
        ];
    }
}
