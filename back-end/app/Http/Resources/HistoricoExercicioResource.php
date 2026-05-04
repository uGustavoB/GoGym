<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HistoricoExercicioResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'exercicio' => $this->resource->exercicio,
            'periodo' => $this->resource->periodo,
            'historico' => $this->resource->historico,
        ];
    }
}
