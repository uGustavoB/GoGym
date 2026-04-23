<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FichaTreinoResource extends JsonResource
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
            'aluno_id' => $this->aluno_id,
            'nome' => $this->nome,
            'objetivo' => $this->objetivo,
            'observacoes_gerais' => $this->observacoes_gerais,
            'data_inicio' => $this->data_inicio?->format('Y-m-d'),
            'data_vencimento' => $this->data_vencimento?->format('Y-m-d'),
            'semanas' => FichaSemanaResource::collection($this->whenLoaded('semanas')),
            'rotinas' => RotinaSessaoResource::collection($this->whenLoaded('rotinas')),
            'cadastrado_em' => $this->created_at?->format('Y-m-d H:i:s'),
            'atualizado_em' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
