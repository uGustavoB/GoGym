<?php

namespace App\Http\Requests\Personais;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AtualizarPersonalRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'usuario_id' => 'sometimes|required|exists:usuarios,id',
            'telefone' => 'sometimes|required|string|max:20',
            'genero' => 'sometimes|required|string|in:masculino,feminino,nao_binario,outro,prefiro_nao_informar',
        ];
    }

    public function messages(): array
    {
        return [
            'usuario_id.exists' => 'O usuário selecionado não existe.',
            'genero.in' => 'O campo gênero deve ser um dos seguintes: masculino, feminino, nao_binario, prefiro_nao_informar, outro.',
        ];
    }
}
