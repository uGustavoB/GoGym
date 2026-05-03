<?php

namespace App\Http\Requests\Treinos;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AtualizarFichaTreinoRequest extends FormRequest
{
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
        $personalId = $this->user()->personal->id;
        $fichaId = $this->route('ficha_treino')?->id;

        return [
            'aluno_id' => [
                'required',
                'integer',
                Rule::exists('aluno_personal', 'aluno_id')
                    ->where('personal_id', $personalId)
                    ->where('status', 'ativo'),
            ],
            'nome' => 'required|string|max:255',
            'objetivo' => 'nullable|string|max:255',
            'observacoes_gerais' => 'nullable|string|max:5000',
            'data_inicio' => 'required|date',
            'data_vencimento' => 'nullable|date|after_or_equal:data_inicio',

            // Semanas (periodização) — recriadas integralmente (sem referências externas)
            'semanas' => 'required|array|min:1',
            'semanas.*.id' => 'nullable|integer',
            'semanas.*.numero_semana' => 'required|integer|min:1',
            'semanas.*.descricao_fase' => 'required|string|max:255',
            'semanas.*.repeticoes_alvo' => 'required|string|max:50',
            'semanas.*.rir_alvo' => 'nullable|integer|min:0|max:10',
            'semanas.*.intensidade_carga' => 'nullable|string|max:255',

            // Rotinas (sessões) — upsert inteligente para preservar IDs referenciados por LogSessao
            'rotinas' => 'required|array|min:1',
            'rotinas.*.id' => [
                'nullable',
                'integer',
                Rule::exists('rotinas_sessoes', 'id')
                    ->where('ficha_treino_id', $fichaId),
            ],
            'rotinas.*.letra_nome' => 'required|string|max:10',

            // Exercícios — upsert inteligente para preservar IDs referenciados por LogSerie
            'rotinas.*.exercicios' => 'required|array|min:1',
            'rotinas.*.exercicios.*.id' => 'nullable|integer',
            'rotinas.*.exercicios.*.exercicio_id' => [
                'required',
                'integer',
                Rule::exists('exercicios', 'id')->whereNull('deleted_at'),
            ],
            'rotinas.*.exercicios.*.ordem' => 'required|integer|min:1',
            'rotinas.*.exercicios.*.tipo_serie' => 'required|string|in:aquecimento,preparacao,trabalho,mista',
            'rotinas.*.exercicios.*.series' => 'required|integer|min:1',
            'rotinas.*.exercicios.*.repeticoes' => 'nullable|string|max:50',
            'rotinas.*.exercicios.*.rir' => 'nullable|integer|min:0|max:10',
            'rotinas.*.exercicios.*.carga_sugerida' => 'nullable|string|max:100',
            'rotinas.*.exercicios.*.tecnica_avancada' => 'nullable|string|in:nenhuma,drop-set,bi-set,rest-pause,cluster,ponto_zero',
            'rotinas.*.exercicios.*.descanso_segundos' => 'nullable|integer|min:0',
            'rotinas.*.exercicios.*.observacoes' => 'nullable|string|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            // Ficha principal
            'aluno_id.required' => 'O aluno é obrigatório.',
            'aluno_id.exists' => 'O aluno selecionado não pertence a você ou não possui vínculo ativo.',
            'nome.required' => 'O nome da ficha de treino é obrigatório.',
            'data_inicio.required' => 'A data de início é obrigatória.',
            'data_inicio.date' => 'A data de início deve ser uma data válida.',
            'data_vencimento.after_or_equal' => 'A data de vencimento deve ser igual ou posterior à data de início.',

            // Semanas
            'semanas.required' => 'É necessário informar ao menos uma semana de treino.',
            'semanas.min' => 'É necessário informar ao menos uma semana de treino.',
            'semanas.*.numero_semana.required' => 'O número da semana é obrigatório.',
            'semanas.*.descricao_fase.required' => 'A descrição da fase da semana é obrigatória.',
            'semanas.*.repeticoes_alvo.required' => 'As repetições alvo da semana são obrigatórias.',

            // Rotinas
            'rotinas.required' => 'É necessário informar ao menos uma rotina (sessão de treino).',
            'rotinas.min' => 'É necessário informar ao menos uma rotina (sessão de treino).',
            'rotinas.*.id.exists' => 'A rotina informada não pertence a esta ficha.',
            'rotinas.*.letra_nome.required' => 'O nome/letra da rotina é obrigatório (ex: A, B, C).',

            // Exercícios
            'rotinas.*.exercicios.required' => 'Cada rotina deve conter ao menos um exercício.',
            'rotinas.*.exercicios.min' => 'Cada rotina deve conter ao menos um exercício.',
            'rotinas.*.exercicios.*.exercicio_id.required' => 'O exercício é obrigatório.',
            'rotinas.*.exercicios.*.exercicio_id.exists' => 'O exercício selecionado não foi encontrado.',
            'rotinas.*.exercicios.*.ordem.required' => 'A ordem do exercício é obrigatória.',
            'rotinas.*.exercicios.*.tipo_serie.required' => 'O tipo da série é obrigatório.',
            'rotinas.*.exercicios.*.tipo_serie.in' => 'O tipo da série deve ser: aquecimento, preparacao, trabalho ou mista.',
            'rotinas.*.exercicios.*.series.required' => 'O número de séries é obrigatório.',
            'rotinas.*.exercicios.*.series.min' => 'O número de séries deve ser no mínimo 1.',
            'rotinas.*.exercicios.*.tecnica_avancada.in' => 'A técnica avançada informada não é válida.',
        ];
    }
}
