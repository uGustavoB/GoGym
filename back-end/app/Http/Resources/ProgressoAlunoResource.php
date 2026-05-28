<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProgressoAlunoResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'periodo' => $this->resource->periodo,
            'volume_load_semanal' => $this->resource->volume_load_semanal,
            'carga_maxima_por_exercicio' => $this->resource->carga_maxima_por_exercicio,
            'esforco_por_sessao' => $this->resource->esforco_por_sessao,
            'frequencia_semanal' => $this->resource->frequencia_semanal,
        ];
    }
}
