<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LogSessaoResource extends JsonResource
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
            'rotina_sessao' => [
                'id' => $this->rotinaSessao?->id,
                'letra_nome' => $this->rotinaSessao?->letra_nome,
            ],
            'data_execucao' => $this->data_execucao?->format('Y-m-d'),
            'esforco_percebido' => $this->esforco_percebido,
            'duracao_minutos' => $this->duracao_minutos,
            'observacoes_aluno' => $this->observacoes_aluno,
            'series' => LogSerieResource::collection($this->whenLoaded('logSeries')),
            'registado_em' => $this->created_at?->format('Y-m-d H:i:s'),
        ];
    }
}
