<?php

namespace App\Http\Requests\Alunos;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ArmazenarAlunoRequest extends FormRequest
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
            'telefone' => 'required|string|max:20',
            'genero' => 'nullable|string|in:masculino,feminino,nao_binario,outro,prefiro_nao_informar',
            'data_nascimento' => 'nullable|date',
            'peso' => 'nullable|numeric|min:0',
            'altura' => 'nullable|numeric|min:0',
            'ativo' => 'boolean',
            'token_convite' => 'nullable|string',
        ];
    }

    public function messages(): array
    {
        return [
            'usuario_id.required' => 'O campo usuário é obrigatório.',
            'usuario_id.exists' => 'O usuário selecionado não existe.',
            'usuario_id.unique' => 'O usuário selecionado já está associado a um aluno/personal.',
            'telefone.required' => 'O campo telefone é obrigatório.',
            'telefone.max' => 'O campo telefone deve ter no máximo 20 caracteres.',
            'genero.in' => 'O campo gênero deve ser um dos seguintes: masculino, feminino, nao_binario, outro, prefiro_nao_informar.',
            'data_nascimento.date' => 'O campo data de nascimento deve ser uma data válida.',
            'peso.numeric' => 'O campo peso deve ser um número.',
            'peso.min' => 'O campo peso deve ser um valor positivo.',
            'altura.numeric' => 'O campo altura deve ser um número.',
            'altura.min' => 'O campo altura deve ser um valor positivo.',
            'ativo.boolean' => 'O campo ativo deve ser verdadeiro ou falso.',
        ];
    }
}
