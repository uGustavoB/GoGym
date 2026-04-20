<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RedefinirSenhaRequest extends FormRequest
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
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => 'required|email',
            'token' => 'required|string',
            'senha' => 'required|string|min:4|confirmed'
        ];
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'email.required' => 'O endereço de e-mail é obrigatório.',
            'email.email' => 'O formato do e-mail fornecido é inválido.',
            'token.required' => 'O token de validação é obrigatório na requisição.',
            'token.string' => 'O formato do token enviado é inválido.',
            'senha.required' => 'A escolha de uma nova senha é obrigatória.',
            'senha.string' => 'A senha deve ser uma cadeia de texto válida.',
            'senha.min' => 'A senha deve ter no mínimo 4 caracteres.',
            'senha.confirmed' => 'A confirmação de senha não confere.'
        ];
    }
}
