<?php

namespace Database\Factories;

use App\Models\Aluno;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Aluno>
 */
class AlunoFactory extends Factory
{
    protected $model = Aluno::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'telefone' => $this->faker->phoneNumber(),
            'genero' => $this->faker->randomElement(['masculino', 'feminino']),
            'data_nascimento' => $this->faker->dateTimeBetween('-40 years', '-18 years')->format('Y-m-d'),
            'peso' => $this->faker->randomFloat(2, 60, 100),
            'altura' => $this->faker->randomFloat(2, 1.60, 1.90),
            'ativo' => true,
        ];
    }
}
