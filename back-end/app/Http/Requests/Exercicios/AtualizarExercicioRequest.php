<?php

namespace App\Http\Requests\Exercicios;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AtualizarExercicioRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->personal !== null;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nome' => 'sometimes|required|string|max:255',
            'tipo' => 'sometimes|required|string|in:superior,inferior,core,cardio,full_body',
            'grupo_muscular' => 'sometimes|required|string|in:peitoral,costas,ombros,biceps,triceps,quadriceps,posterior_coxa,gluteos,panturrilhas,abdomen,outro',
            'video_url' => 'nullable|string|url|max:2048',
            'instrucoes' => 'nullable|string|max:5000',
        ];
    }

    public function messages(): array
    {
        return [
            'nome.required' => 'O nome do exercício é obrigatório.',
            'nome.max' => 'O nome do exercício deve ter no máximo 255 caracteres.',
            'tipo.required' => 'O tipo do exercício é obrigatório.',
            'tipo.in' => 'O tipo deve ser: superior, inferior, core, cardio ou full_body.',
            'grupo_muscular.required' => 'O grupo muscular é obrigatório.',
            'grupo_muscular.in' => 'O grupo muscular informado não é válido.',
            'video_url.url' => 'A URL do vídeo deve ser uma URL válida.',
            'video_url.max' => 'A URL do vídeo deve ter no máximo 2048 caracteres.',
            'instrucoes.max' => 'As instruções devem ter no máximo 5000 caracteres.',
        ];
    }
}
