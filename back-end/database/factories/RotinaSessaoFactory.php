<?php

namespace Database\Factories;

use App\Models\RotinaSessao;
use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\FichaTreino;

/**
 * @extends Factory<RotinaSessao>
 */
class RotinaSessaoFactory extends Factory
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
            'letra_nome' => $this->faker->randomElement(['A', 'B', 'C', 'D', 'E']),
        ];
    }
}
