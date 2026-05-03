<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\FichaTreino;
use App\Models\FichaSemana;
use App\Models\RotinaSessao;
use App\Models\RotinaExercicio;
use App\Models\Aluno;
use App\Models\Exercicio;

class WorkoutSeeder extends Seeder
{
    public function run(): void
    {
        $alunos = Aluno::all();
        $exerciciosIds = Exercicio::pluck('id')->toArray();

        foreach ($alunos as $aluno) {
            $personalId = $aluno->personais()->first()->id ?? 1;

            $fichas = [
                ['nome' => 'Hipertrofia - Fase 1', 'objetivo' => 'Aumento de massa muscular com foco em técnica.'],
                ['nome' => 'Força - Progressão', 'objetivo' => 'Ganho de força máxima e recrutamento de unidades motoras.'],
            ];

            foreach ($fichas as $fIdx => $fichaData) {
                $ficha = FichaTreino::factory()->create([
                    'personal_id' => $personalId,
                    'aluno_id' => $aluno->id,
                    'nome' => $fichaData['nome'],
                    'objetivo' => $fichaData['objetivo'],
                    'data_inicio' => now()->subMonths(2 - $fIdx)->format('Y-m-d'),
                    'data_vencimento' => now()->subMonths(1 - $fIdx)->format('Y-m-d'),
                ]);

                // 4 Weeks
                $fases = ['Adaptação', 'Base', 'Intensificação', 'Pico'];
                $rirs = [3, 2, 1, 0];
                foreach (range(1, 4) as $semanaIdx) {
                    FichaSemana::factory()->create([
                        'ficha_treino_id' => $ficha->id,
                        'numero_semana' => $semanaIdx,
                        'descricao_fase' => $fases[$semanaIdx - 1],
                        'repeticoes_alvo' => '10-12',
                        'rir_alvo' => $rirs[$semanaIdx - 1],
                    ]);
                }

                // 4 Routines (A, B, C, D)
                $letras = ['A', 'B', 'C', 'D'];
                foreach ($letras as $letra) {
                    $rotina = RotinaSessao::factory()->create([
                        'ficha_treino_id' => $ficha->id,
                        'letra_nome' => $letra,
                    ]);

                    // ~8 random exercises
                    shuffle($exerciciosIds);
                    $selectedExercises = array_slice($exerciciosIds, 0, 8);

                    foreach ($selectedExercises as $ordem => $exId) {
                        RotinaExercicio::factory()->create([
                            'rotina_sessao_id' => $rotina->id,
                            'exercicio_id' => $exId,
                            'ordem' => $ordem + 1,
                            'tipo_serie' => $ordem == 0 ? 'aquecimento' : 'trabalho',
                        ]);
                    }
                }
            }
        }
    }
}
