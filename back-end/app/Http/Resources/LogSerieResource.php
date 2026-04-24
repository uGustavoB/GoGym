<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LogSerieResource extends JsonResource
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
            'rotina_exercicio_id' => $this->rotina_exercicio_id,
            'numero_serie' => $this->numero_serie,
            'repeticoes_realizadas' => $this->repeticoes_realizadas,
            'carga_realizada' => $this->carga_realizada,
            'exercicio' => new RotinaExercicioResource($this->whenLoaded('rotinaExercicio')),
        ];
    }
}
