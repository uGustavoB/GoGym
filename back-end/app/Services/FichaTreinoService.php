<?php

namespace App\Services;

use App\Models\FichaTreino;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class FichaTreinoService
{
    public function listar(): LengthAwarePaginator
    {
        return FichaTreino::with([
            'semanas' => fn ($query) => $query->orderBy('numero_semana'),
            'rotinas' => fn ($query) => $query->orderBy('letra_nome'),
            'rotinas.exercicios' => fn ($query) => $query->orderBy('ordem'),
            'rotinas.exercicios.exercicio',
        ])
        ->orderByDesc('created_at')
        ->paginate(15);
    }

    public function buscarComRelacionamentos(FichaTreino $fichaTreino): FichaTreino
    {
        return $fichaTreino->load([
            'semanas' => fn ($query) => $query->orderBy('numero_semana'),
            'rotinas' => fn ($query) => $query->orderBy('letra_nome'),
            'rotinas.exercicios' => fn ($query) => $query->orderBy('ordem'),
            'rotinas.exercicios.exercicio',
        ]);
    }

    public function criar(array $dados, int $personalId): FichaTreino
    {
        try {
            $fichaTreino = DB::transaction(function () use ($dados, $personalId) {
                // Criar a ficha de treino principal
                $ficha = FichaTreino::create([
                    'personal_id' => $personalId,
                    'aluno_id' => $dados['aluno_id'],
                    'nome' => $dados['nome'],
                    'objetivo' => $dados['objetivo'] ?? null,
                    'observacoes_gerais' => $dados['observacoes_gerais'] ?? null,
                    'data_inicio' => $dados['data_inicio'],
                    'data_vencimento' => $dados['data_vencimento'] ?? null,
                ]);

                // Criar as semanas de periodização
                $this->criarSemanas($ficha, $dados['semanas']);

                // Criar as rotinas e seus exercícios
                $this->criarRotinas($ficha, $dados['rotinas']);

                return $ficha;
            });

            // Carregar relacionamentos para a resposta
            return $fichaTreino->load([
                'aluno.usuario',
                'semanas',
                'rotinas.exercicios.exercicio',
            ]);
        } catch (\Throwable $e) {
            Log::error('Erro ao criar ficha de treino', [
                'personal_id' => $personalId,
                'erro' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    public function atualizar(FichaTreino $fichaTreino, array $dados): FichaTreino
    {
        try {
            return DB::transaction(function () use ($fichaTreino, $dados) {
                // Atualizar campos da ficha principal
                $fichaTreino->update([
                    'aluno_id' => $dados['aluno_id'],
                    'nome' => $dados['nome'],
                    'objetivo' => $dados['objetivo'] ?? null,
                    'observacoes_gerais' => $dados['observacoes_gerais'] ?? null,
                    'data_inicio' => $dados['data_inicio'],
                    'data_vencimento' => $dados['data_vencimento'] ?? null,
                ]);

                // Sincronizar semanas
                $this->sincronizarSemanas($fichaTreino, $dados['semanas']);

                // Sincronizar rotinas e exercícios
                $this->sincronizarRotinas($fichaTreino, $dados['rotinas']);

                return $fichaTreino->load([
                    'aluno.usuario',
                    'semanas' => fn ($query) => $query->orderBy('numero_semana'),
                    'rotinas' => fn ($query) => $query->orderBy('letra_nome'),
                    'rotinas.exercicios' => fn ($query) => $query->orderBy('ordem'),
                    'rotinas.exercicios.exercicio',
                ]);
            });
        } catch (\Throwable $e) {
            Log::error('Erro ao atualizar ficha de treino', [
                'ficha_id' => $fichaTreino->id,
                'erro' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            throw $e;
        }
    }

    public function deletar(FichaTreino $fichaTreino): void
    {
        $fichaTreino->delete();
    }

    private function sincronizarSemanas(FichaTreino $ficha, array $semanas): void
    {
        $ficha->semanas()->delete();
        $this->criarSemanas($ficha, $semanas);
    }

    private function sincronizarRotinas(FichaTreino $ficha, array $rotinas): void
    {
        $idsRecebidos = collect($rotinas)
            ->pluck('id')
            ->filter()
            ->values()
            ->all();

        // Soft delete das rotinas que não vieram no payload
        $ficha->rotinas()
            ->whereNotIn('id', $idsRecebidos)
            ->each(function ($rotina) {
                $rotina->exercicios()->delete();
                $rotina->delete();
            });

        foreach ($rotinas as $rotinaData) {
            if (!empty($rotinaData['id'])) {
                // Atualiza
                $rotina = $ficha->rotinas()->find($rotinaData['id']);
                if ($rotina) {
                    $rotina->update([
                        'letra_nome' => $rotinaData['letra_nome'],
                    ]);
                    $this->sincronizarExercicios($rotina, $rotinaData['exercicios']);
                }
            } else {
                // Cria
                $rotina = $ficha->rotinas()->create([
                    'letra_nome' => $rotinaData['letra_nome'],
                ]);
                $this->criarExerciciosRotina($rotina, $rotinaData['exercicios']);
            }
        }
    }

    private function sincronizarExercicios($rotina, array $exercicios): void
    {
        $idsRecebidos = collect($exercicios)
            ->pluck('id')
            ->filter()
            ->values()
            ->all();

        // Deleta exercícios que foram removidos pelo personal
        $rotina->exercicios()
            ->whereNotIn('id', $idsRecebidos)
            ->delete();

        foreach ($exercicios as $exercicioData) {
            $campos = [
                'exercicio_id' => $exercicioData['exercicio_id'],
                'ordem' => $exercicioData['ordem'],
                'tipo_serie' => $exercicioData['tipo_serie'],
                'series' => $exercicioData['series'],
                'repeticoes' => $exercicioData['repeticoes'] ?? null,
                'rir' => $exercicioData['rir'] ?? null,
                'carga_sugerida' => $exercicioData['carga_sugerida'] ?? null,
                'tecnica_avancada' => $exercicioData['tecnica_avancada'] ?? null,
                'descanso_segundos' => $exercicioData['descanso_segundos'] ?? null,
                'observacoes' => $exercicioData['observacoes'] ?? null,
            ];

            if (!empty($exercicioData['id'])) {
                // Atualiza
                $exercicio = $rotina->exercicios()->find($exercicioData['id']);
                if ($exercicio) {
                    $exercicio->update($campos);
                }
            } else {
                // Cria
                $rotina->exercicios()->create($campos);
            }
        }
    }

    private function criarSemanas(FichaTreino $ficha, array $semanas): void
    {
        foreach ($semanas as $semanaData) {
            $ficha->semanas()->create([
                'numero_semana' => $semanaData['numero_semana'],
                'descricao_fase' => $semanaData['descricao_fase'],
                'repeticoes_alvo' => $semanaData['repeticoes_alvo'],
                'rir_alvo' => $semanaData['rir_alvo'] ?? null,
                'intensidade_carga' => $semanaData['intensidade_carga'] ?? null,
            ]);
        }
    }

    private function criarRotinas(FichaTreino $ficha, array $rotinas): void
    {
        foreach ($rotinas as $rotinaData) {
            $rotina = $ficha->rotinas()->create([
                'letra_nome' => $rotinaData['letra_nome'],
            ]);

            $this->criarExerciciosRotina($rotina, $rotinaData['exercicios']);
        }
    }

    private function criarExerciciosRotina($rotina, array $exercicios): void
    {
        foreach ($exercicios as $exercicioData) {
            $rotina->exercicios()->create([
                'exercicio_id' => $exercicioData['exercicio_id'],
                'ordem' => $exercicioData['ordem'],
                'tipo_serie' => $exercicioData['tipo_serie'],
                'series' => $exercicioData['series'],
                'repeticoes' => $exercicioData['repeticoes'] ?? null,
                'rir' => $exercicioData['rir'] ?? null,
                'carga_sugerida' => $exercicioData['carga_sugerida'] ?? null,
                'tecnica_avancada' => $exercicioData['tecnica_avancada'] ?? null,
                'descanso_segundos' => $exercicioData['descanso_segundos'] ?? null,
                'observacoes' => $exercicioData['observacoes'] ?? null,
            ]);
        }
    }
}
