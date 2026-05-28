<?php

namespace Database\Factories;

use App\Models\FichaSemana;
use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\FichaTreino;

/**
 * @extends Factory<FichaSemana>
 */
class FichaSemanaFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'ficha_treino_id' => FichaTreino::factory(),
            'numero_semana' => 1,
            'descricao_fase' => 'Adaptação',
            'repeticoes_alvo' => '10-12',
            'rir_alvo' => $this->faker->numberBetween(1, 3),
            'intensidade_carga' => 'Moderada',
        ];
    }
}
