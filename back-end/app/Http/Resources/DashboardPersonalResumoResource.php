<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DashboardPersonalResumoResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'total_alunos_ativos' => $this->resource->total_alunos_ativos,
            'adesao_semanal' => $this->resource->adesao_semanal,
            'media_esforco_global' => $this->resource->media_esforco_global,
            'top_frequentes' => $this->resource->top_frequentes,
            'menos_frequentes' => $this->resource->menos_frequentes,
        ];
    }
}
