<?php

namespace App\Http\Requests\Treinos;

use App\Models\RotinaSessao;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class RegistrarSessaoRequest extends FormRequest
{
    /**
     * Verifica se o utilizador é um aluno e se a rotina pertence a ele.
     */
    public function authorize(): bool
    {
        $aluno = $this->user()?->aluno;

        if (!$aluno) {
            return false;
        }

        // Validar que a rotina_sessao_id pertence a uma FichaTreino do aluno autenticado
        $rotinaSessaoId = $this->input('rotina_sessao_id');

        if (!$rotinaSessaoId) {
            // Deixa a validação de required tratar
            return true;
        }

        return RotinaSessao::where('id', $rotinaSessaoId)
            ->whereHas('fichaTreino', function ($query) use ($aluno) {
                $query->where('aluno_id', $aluno->id);
            })
            ->exists();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'rotina_sessao_id' => 'required|integer|exists:rotinas_sessoes,id',
            'data_execucao' => 'required|date',
            'esforco_percebido' => 'required|integer|min:1|max:10',
            'duracao_minutos' => 'required|integer|min:1',
            'observacoes_aluno' => 'nullable|string|max:5000',

            // Séries realizadas
            'series' => 'required|array|min:1',
            'series.*.rotina_exercicio_id' => 'required|integer|exists:rotinas_exercicios,id',
            'series.*.numero_serie' => 'required|integer|min:1',
            'series.*.repeticoes_realizadas' => 'required|integer|min:0',
            'series.*.carga_realizada' => 'required|string|max:100',
        ];
    }

    public function messages(): array
    {
        return [
            'rotina_sessao_id.required' => 'A rotina de sessão é obrigatória.',
            'rotina_sessao_id.exists' => 'A rotina de sessão informada não existe.',
            'data_execucao.required' => 'A data de execução é obrigatória.',
            'data_execucao.date' => 'A data de execução deve ser uma data válida.',
            'esforco_percebido.required' => 'O esforço percebido (PSE) é obrigatório.',
            'esforco_percebido.min' => 'O esforço percebido deve ser no mínimo 1.',
            'esforco_percebido.max' => 'O esforço percebido deve ser no máximo 10.',
            'duracao_minutos.required' => 'A duração em minutos é obrigatória.',
            'duracao_minutos.min' => 'A duração deve ser no mínimo 1 minuto.',

            // Séries
            'series.required' => 'É necessário informar ao menos uma série realizada.',
            'series.min' => 'É necessário informar ao menos uma série realizada.',
            'series.*.rotina_exercicio_id.required' => 'O exercício da rotina é obrigatório para cada série.',
            'series.*.rotina_exercicio_id.exists' => 'O exercício da rotina informado não existe.',
            'series.*.numero_serie.required' => 'O número da série é obrigatório.',
            'series.*.numero_serie.min' => 'O número da série deve ser no mínimo 1.',
            'series.*.repeticoes_realizadas.required' => 'As repetições realizadas são obrigatórias.',
            'series.*.repeticoes_realizadas.min' => 'As repetições realizadas devem ser no mínimo 0.',
            'series.*.carga_realizada.required' => 'A carga realizada é obrigatória.',
            'series.*.carga_realizada.max' => 'A carga realizada deve ter no máximo 100 caracteres.',
        ];
    }
}
