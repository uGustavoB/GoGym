<?php

namespace Database\Factories;

use App\Models\FichaTreino;
use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Personal;
use App\Models\Aluno;

/**
 * @extends Factory<FichaTreino>
 */
class FichaTreinoFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'personal_id' => Personal::factory(),
            'aluno_id' => Aluno::factory(),
            'nome' => $this->faker->randomElement(['Hipertrofia - Fase 1', 'Força Máxima', 'Adaptação Anatômica', 'Resistência Muscular']),
            'objetivo' => $this->faker->sentence(),
            'observacoes_gerais' => $this->faker->paragraph(),
            'data_inicio' => $this->faker->dateTimeBetween('-1 month', 'now')->format('Y-m-d'),
            'data_vencimento' => $this->faker->dateTimeBetween('now', '+2 months')->format('Y-m-d'),
        ];
    }
}
