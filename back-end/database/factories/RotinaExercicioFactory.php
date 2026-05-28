<?php

namespace Database\Factories;

use App\Models\RotinaExercicio;
use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\RotinaSessao;
use App\Models\Exercicio;

/**
 * @extends Factory<RotinaExercicio>
 */
class RotinaExercicioFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'rotina_sessao_id' => RotinaSessao::factory(),
            'exercicio_id' => Exercicio::factory(),
            'ordem' => $this->faker->numberBetween(1, 10),
            'tipo_serie' => $this->faker->randomElement(['aquecimento', 'preparacao', 'trabalho', 'mista']),
            'series' => $this->faker->numberBetween(1, 4),
            'repeticoes' => '10-12',
            'rir' => $this->faker->numberBetween(0, 3),
            'carga_sugerida' => null,
            'tecnica_avancada' => $this->faker->randomElement(['nenhuma', 'drop-set', 'rest-pause', null]),
            'descanso_segundos' => $this->faker->randomElement([60, 90, 120]),
            'observacoes' => null,
        ];
    }
}
