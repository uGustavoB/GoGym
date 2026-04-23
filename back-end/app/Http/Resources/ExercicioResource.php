<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ExercicioResource extends JsonResource
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
            'nome' => $this->nome,
            'tipo' => $this->tipo,
            'grupo_muscular' => $this->grupo_muscular,
            'video_url' => $this->video_url,
            'instrucoes' => $this->instrucoes,
            'is_global' => $this->personal_id === null,
            'cadastrado_em' => $this->created_at?->format('Y-m-d H:i:s'),
        ];
    }
}
