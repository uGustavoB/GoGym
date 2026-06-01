<?php

namespace App\Services;

use App\Models\FichaTreino;
use App\Models\Usuario;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class FichaTreinoService
{
    public function listar(Usuario $usuario): LengthAwarePaginator
    {
        $query = FichaTreino::with([
            'semanas' => fn ($q) => $q->orderBy('numero_semana'),
            'rotinas' => fn ($q) => $q->orderBy('letra_nome'),
            'rotinas.exercicios' => fn ($q) => $q->orderBy('ordem'),
            'rotinas.exercicios.exercicio',
        ])->orderByDesc('created_at');

        if ($usuario->personal) {
            $query->where('personal_id', $usuario->personal->id);
        } elseif ($usuario->aluno) {
            $query->where('aluno_id', $usuario->aluno->id);
        } else {
            // Usuário sem perfil: retorna vazio de forma segura (não vaza dados)
            $query->whereNull('id');
        }

        return $query->paginate(15);
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

    public function criar(array $dados, Usuario $usuario): FichaTreino
    {
        try {
            $fichaTreino = DB::transaction(function () use ($dados, $usuario) {
                if ($usuario->personal) {
                    $dados['personal_id'] = $usuario->personal->id;
                    // aluno_id já vem validado no $dados
                } else {
                    if ($usuario->aluno === null) {
                        throw new \DomainException(
                            "Usuário {$usuario->id} não possui perfil de aluno."
                        );
                    }
                    $dados['personal_id'] = null;
                    $dados['aluno_id']    = $usuario->aluno->id;
                }

                $ficha = FichaTreino::create([
                    'personal_id' => $dados['personal_id'],
                    'aluno_id' => $dados['aluno_id'],
                    'nome' => $dados['nome'],
                    'objetivo' => $dados['objetivo'] ?? null,
                    'observacoes_gerais' => $dados['observacoes_gerais'] ?? null,
                    'data_inicio' => $dados['data_inicio'],
                    'data_vencimento' => $dados['data_vencimento'] ?? null,
                ]);

                $this->criarSemanas($ficha, $dados['semanas']);
                $this->criarRotinas($ficha, $dados['rotinas']);

                return $ficha;
            });

            return $fichaTreino->load([
                'aluno.usuario',
                'semanas',
                'rotinas.exercicios.exercicio',
            ]);
        } catch (\Throwable $e) {
            Log::error('Erro ao criar ficha de treino', [
                'usuario_id' => $usuario->id,
                'erro' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    public function atualizar(FichaTreino $fichaTreino, array $dados, Usuario $usuario): FichaTreino
    {
        try {
            return DB::transaction(function () use ($fichaTreino, $dados, $usuario) {
                $camposAtualizar = [
                    'nome' => $dados['nome'],
                    'objetivo' => $dados['objetivo'] ?? null,
                    'observacoes_gerais' => $dados['observacoes_gerais'] ?? null,
                    'data_inicio' => $dados['data_inicio'],
                    'data_vencimento' => $dados['data_vencimento'] ?? null,
                ];

                // Personal pode reatribuir a ficha a outro aluno
                if (array_key_exists('aluno_id', $dados)) {
                    $camposAtualizar['aluno_id'] = $dados['aluno_id'];
                }

                $fichaTreino->update($camposAtualizar);

                $this->sincronizarSemanas($fichaTreino, $dados['semanas']);
                $this->sincronizarRotinas($fichaTreino, $dados['rotinas']);

                return $fichaTreino->load([
                    'aluno.usuario',
                    'semanas' => fn ($q) => $q->orderBy('numero_semana'),
                    'rotinas' => fn ($q) => $q->orderBy('letra_nome'),
                    'rotinas.exercicios' => fn ($q) => $q->orderBy('ordem'),
                    'rotinas.exercicios.exercicio',
                ]);
            });
        } catch (\Throwable $e) {
            Log::error('Erro ao atualizar ficha de treino', [
                'ficha_id' => $fichaTreino->id,
                'usuario_id' => $usuario->id,
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

        $ficha->rotinas()
            ->whereNotIn('id', $idsRecebidos)
            ->each(function ($rotina) {
                $rotina->exercicios()->delete();
                $rotina->delete();
            });

        foreach ($rotinas as $rotinaData) {
            if (!empty($rotinaData['id'])) {
                $rotina = $ficha->rotinas()->find($rotinaData['id']);
                if ($rotina) {
                    $rotina->update(['letra_nome' => $rotinaData['letra_nome']]);
                    $this->sincronizarExercicios($rotina, $rotinaData['exercicios']);
                }
            } else {
                $rotina = $ficha->rotinas()->create(['letra_nome' => $rotinaData['letra_nome']]);
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

        $rotina->exercicios()->whereNotIn('id', $idsRecebidos)->delete();

        foreach ($exercicios as $exercicioData) {
            $campos = $this->camposExercicio($exercicioData);

            if (!empty($exercicioData['id'])) {
                $exercicio = $rotina->exercicios()->find($exercicioData['id']);
                if ($exercicio) {
                    $exercicio->update($campos);
                }
            } else {
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
                'repeticoes_alvo'  => $semanaData['repeticoes_alvo'],
                'rir_alvo' => $semanaData['rir_alvo'] ?? null,
                'intensidade_carga' => $semanaData['intensidade_carga'] ?? null,
            ]);
        }
    }

    private function criarRotinas(FichaTreino $ficha, array $rotinas): void
    {
        foreach ($rotinas as $rotinaData) {
            $rotina = $ficha->rotinas()->create(['letra_nome' => $rotinaData['letra_nome']]);
            $this->criarExerciciosRotina($rotina, $rotinaData['exercicios']);
        }
    }

    private function criarExerciciosRotina($rotina, array $exercicios): void
    {
        foreach ($exercicios as $exercicioData) {
            $rotina->exercicios()->create($this->camposExercicio($exercicioData));
        }
    }

    private function camposExercicio(array $exercicioData): array
    {
        return [
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
    }
}
