<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\FichaTreino;
use App\Models\LogSessao;
use App\Models\LogSerie;
use Carbon\Carbon;

class WorkoutLogSeeder extends Seeder
{
    public function run(): void
    {
        $fichas = FichaTreino::with(['aluno', 'semanas', 'rotinas.exercicios.exercicio'])->get();

        foreach ($fichas as $ficha) {
            $dataInicio = Carbon::parse($ficha->data_inicio);

            $exerciciosConfig = [];
            foreach ($ficha->rotinas as $rotina) {
                foreach ($rotina->exercicios as $rotinaExercicio) {
                    $nome = strtolower($rotinaExercicio->exercicio->nome ?? '');
                    
                    if (str_contains($nome, 'agachamento') || str_contains($nome, 'leg press') || str_contains($nome, 'terra')) {
                        $baseLoad = rand(30, 80);
                        $step = rand(1, 4); // Progressão moderada para grandes grupos
                    } elseif (str_contains($nome, 'supino') || str_contains($nome, 'remada') || str_contains($nome, 'puxada')) {
                        $baseLoad = rand(15, 40);
                        $step = rand(1, 2);
                    } elseif (str_contains($nome, 'rosca') || str_contains($nome, 'tríceps') || str_contains($nome, 'elevação lateral')) {
                        $baseLoad = rand(5, 15);
                        $step = rand(0, 1) > 0 ? 1 : 0.5; // Menos progressão para isoladores
                    } else {
                        $baseLoad = rand(10, 30);
                        $step = rand(1, 2);
                    }

                    $exerciciosConfig[$rotinaExercicio->id] = [
                        'base' => $baseLoad,
                        'step' => $step
                    ];
                }
            }

            foreach ($ficha->semanas as $semanaIdx => $semana) {
                foreach ($ficha->rotinas as $rotinaIdx => $rotina) {
                    $diasAdicionais = ($semanaIdx * 7) + $rotinaIdx + 1;
                    $dataSessao = $dataInicio->copy()->addDays($diasAdicionais);

                    if ($dataSessao->isFuture()) {
                        continue;
                    }

                    $esforco = min(9, 6 + $semanaIdx);

                    $logSessao = LogSessao::create([
                        'aluno_id' => $ficha->aluno_id,
                        'rotina_sessao_id' => $rotina->id,
                        'data_execucao' => $dataSessao->format('Y-m-d'),
                        'esforco_percebido' => $esforco,
                        'duracao_minutos' => rand(45, 75),
                        'observacoes_aluno' => rand(1, 10) > 8 ? 'Treino muito bom hoje!' : null,
                    ]);

                    foreach ($rotina->exercicios as $rotinaExercicio) {
                        $config = $exerciciosConfig[$rotinaExercicio->id];
                        $cargaAtual = $config['base'];

                        // Adiciona progressão com variação ao longo das semanas
                        for ($w = 0; $w < $semanaIdx; $w++) {
                            // 60% de chance de conseguir progredir carga
                            if (rand(1, 100) <= 60) {
                                $cargaAtual += $config['step'];
                            } else {
                                // 20% de chance de reduzir a carga (dia ruim, má noite de sono)
                                if (rand(1, 100) <= 50) {
                                    $cargaAtual -= ($config['step'] * 0.5);
                                    if ($cargaAtual < $config['base'] * 0.5) { 
                                        $cargaAtual = $config['base'] * 0.5;
                                    }
                                }
                            }
                        }

                        for ($serie = 1; $serie <= $rotinaExercicio->series; $serie++) {
                            // Fator fadiga: pequena chance da carga cair um pouco nas últimas séries
                            $fatorFadiga = $serie > 2 && rand(1, 100) <= 30 ? ($config['step'] * 0.5) : 0;
                            $cargaFinalSerie = max(1, $cargaAtual - $fatorFadiga);

                            LogSerie::create([
                                'log_sessao_id' => $logSessao->id,
                                'rotina_exercicio_id' => $rotinaExercicio->id,
                                'numero_serie' => $serie,
                                'repeticoes_realizadas' => rand(8, 12),
                                'carga_realizada' => $cargaFinalSerie . 'kg',
                            ]);
                        }
                    }
                }
            }
        }
    }
}
