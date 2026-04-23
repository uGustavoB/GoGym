<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RotinaExercicioResource extends JsonResource
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
            'ordem' => $this->ordem,
            'tipo_serie' => $this->tipo_serie,
            'series' => $this->series,
            'repeticoes' => $this->repeticoes,
            'rir' => $this->rir,
            'carga_sugerida' => $this->carga_sugerida,
            'tecnica_avancada' => $this->tecnica_avancada,
            'descanso_segundos' => $this->descanso_segundos,
            'observacoes' => $this->observacoes,
            'exercicio' => new ExercicioResource($this->whenLoaded('exercicio')),
        ];
    }
}
