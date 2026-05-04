<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DashboardAlunoResumoResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'total_sessoes' => $this->resource->total_sessoes,
            'media_duracao_minutos' => $this->resource->media_duracao_minutos,
            'media_esforco' => $this->resource->media_esforco,
            'sequencia_dias' => $this->resource->sequencia_dias,
            'melhor_sequencia' => $this->resource->melhor_sequencia,
            'ultima_sessao' => $this->resource->ultima_sessao,
        ];
    }
}
