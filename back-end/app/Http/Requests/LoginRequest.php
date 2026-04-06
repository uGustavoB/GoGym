<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class LoginRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => 'required|email',
            'senha' => 'required',
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'Por favor, insira seu e-mail.',
            'email.email' => 'Por favor, insira um endereço de e-mail válido.',
            'senha.required' => 'Por favor, insira sua senha.',
        ];
    }
}
