<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class RegistrarRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'nome' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:usuarios',
            'senha' => 'required|string|min:4',
        ];
    }

    public function messages(): array
    {
        return [
//          Nome
            'nome.required' => 'Por favor, insira seu nome.',
            'nome.max' => 'O nome deve ter menos de 255 caracteres.',
//          Email
            'email.email' => 'Por favor, insira um endereço de e-mail válido.',
            'email.required' => 'O campo de e-mail é obrigatório.',
            'email.unique' => 'Este e-mail já está em uso.',
//          Senha
            'senha.required' => 'O campo de senha é obrigatório.',
            'senha.min' => 'A senha deve ter pelo menos 4 caracteres.',
        ];
    }
}
