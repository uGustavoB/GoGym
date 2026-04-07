<?php

namespace App\Http\Requests\Personais;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ArmazenarPersonalRequest extends FormRequest
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
            'usuario_id' => 'required|exists:usuarios,id|unique:personais,usuario_id',
            'telefone' => 'required|string|max:20',
            'genero' => 'required|string|in:masculino,feminino,nao_binario,outro, prefiro_nao_informar',
        ];
    }

    public function messages(): array
    {
        return [
            'usuario_id.required' => 'O campo usuário é obrigatório.',
            'usuario_id.exists' => 'O usuário selecionado não existe.',
            'usuario_id.unique' => 'O usuário selecionado já é um personal trainer.',
            'telefone.required' => 'O campo telefone é obrigatório.',
            'telefone.string' => 'O campo telefone deve ser uma string.',
            'telefone.max' => 'O campo telefone deve ter no máximo 20 caracteres.',
            'genero.required' => 'O campo gênero é obrigatório.',
            'genero.in' => 'O campo gênero deve ser um dos seguintes: masculino, feminino, nao_binario, outro, prefiro_nao_informar.',
        ];
    }
}
