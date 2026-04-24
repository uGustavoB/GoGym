<?php

namespace App\Services;

use App\Models\FichaTreino;
use App\Models\LogSessao;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

class RegistroTreinoService
{
    public function buscarTreinoAtual(int $alunoId): ?FichaTreino
    {
        $hoje = now()->toDateString();

        // Primeira tentativa: ficha ativa para a data atual
        $ficha = FichaTreino::where('aluno_id', $alunoId)
            ->where('data_inicio', '<=', $hoje)
            ->where(function ($query) use ($hoje) {
                $query->where('data_vencimento', '>=', $hoje)
                    ->orWhereNull('data_vencimento');
            })
            ->with([
                'semanas' => fn ($q) => $q->orderBy('numero_semana'),
                'rotinas' => fn ($q) => $q->orderBy('letra_nome'),
                'rotinas.exercicios' => fn ($q) => $q->orderBy('ordem'),
                'rotinas.exercicios.exercicio',
            ])
            ->orderByDesc('data_inicio')
            ->first();

        if ($ficha) {
            return $ficha;
        }

        // Se não encontrar ficha ativa, buscar a mais recente (mesmo que vencida)
        return FichaTreino::where('aluno_id', $alunoId)
            ->with([
                'semanas' => fn ($q) => $q->orderBy('numero_semana'),
                'rotinas' => fn ($q) => $q->orderBy('letra_nome'),
                'rotinas.exercicios' => fn ($q) => $q->orderBy('ordem'),
                'rotinas.exercicios.exercicio',
            ])
            ->orderByDesc('data_inicio')
            ->first();
    }

    /**
     * @throws Throwable
     */
    public function registrarSessao(array $dados, int $alunoId): LogSessao
    {
        try {
            $logSessao = DB::transaction(function () use ($dados, $alunoId) {
                // Criar o log da sessão
                $sessao = LogSessao::create([
                    'aluno_id' => $alunoId,
                    'rotina_sessao_id' => $dados['rotina_sessao_id'],
                    'data_execucao' => $dados['data_execucao'],
                    'esforco_percebido' => $dados['esforco_percebido'],
                    'duracao_minutos' => $dados['duracao_minutos'],
                    'observacoes_aluno' => $dados['observacoes_aluno'] ?? null,
                ]);

                // Criar os logs de cada série
                foreach ($dados['series'] as $serieData) {
                    $sessao->logSeries()->create([
                        'rotina_exercicio_id' => $serieData['rotina_exercicio_id'],
                        'numero_serie' => $serieData['numero_serie'],
                        'repeticoes_realizadas' => $serieData['repeticoes_realizadas'],
                        'carga_realizada' => $serieData['carga_realizada'],
                    ]);
                }

                return $sessao;
            });

            // Carregar relacionamentos para a resposta
            return $logSessao->load([
                'rotinaSessao',
                'logSeries.rotinaExercicio.exercicio',
            ]);
        } catch (Throwable $e) {
            Log::error('Erro ao registar sessão de treino', [
                'aluno_id' => $alunoId,
                'erro' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }
}
