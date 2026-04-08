<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class RegistrarAlunoRequest extends FormRequest
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
            // Usuário
            'nome' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:usuarios,email',
            'senha' => 'required|string|min:4',

            // Aluno
            'telefone' => 'required|string|max:20',
            'genero' => 'nullable|string|in:masculino,feminino,nao_binario,outro,prefiro_nao_informar',
            'data_nascimento' => 'nullable|date',
            'peso' => 'nullable|numeric|min:0',
            'altura' => 'nullable|numeric|min:0',

            //Convite
            'token_convite' => 'nullable|string|exists:convites,token'
        ];
    }
}
