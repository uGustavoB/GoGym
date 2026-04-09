<?php

namespace App\Http\Requests\Alunos;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class AtualizarAlunoRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $aluno = $this->route('aluno');

        return $this->user()->can('update', $aluno);
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
            'genero' => 'sometimes|nullable|string|in:masculino,feminino,nao_binario,outro,prefiro_nao_informar',
            'data_nascimento' => 'sometimes|nullable|date',
            'peso' => 'sometimes|nullable|numeric|min:0',
            'altura' => 'sometimes|nullable|numeric|min:0',
            'ativo' => 'sometimes|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'usuario_id.exists' => 'O usuário selecionado não existe.',
            'usuario_id.required' => 'O campo usuário é obrigatório quando presente.',
            'telefone.required' => 'O campo telefone é obrigatório quando presente.',
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
