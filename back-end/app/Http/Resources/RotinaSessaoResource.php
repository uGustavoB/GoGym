<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RotinaSessaoResource extends JsonResource
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
            'letra_nome' => $this->letra_nome,
            'exercicios' => RotinaExercicioResource::collection($this->whenLoaded('exercicios')),
        ];
    }
}
