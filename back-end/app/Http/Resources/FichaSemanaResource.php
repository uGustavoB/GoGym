<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FichaSemanaResource extends JsonResource
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
            'numero_semana' => $this->numero_semana,
            'descricao_fase' => $this->descricao_fase,
            'repeticoes_alvo' => $this->repeticoes_alvo,
            'rir_alvo' => $this->rir_alvo,
            'intensidade_carga' => $this->intensidade_carga,
        ];
    }
}
