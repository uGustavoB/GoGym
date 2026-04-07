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
            'telefone' => fake()->phoneNumber(),
            'genero' => fake()->randomElement(['masculino', 'feminino']),
            'data_nascimento' => fake()->dateTimeBetween('-40 years', '-18 years')->format('Y-m-d'),
            'peso' => fake()->randomFloat(2, 50, 120),
            'altura' => fake()->randomFloat(2, 1.50, 2.00),
            'ativo' => true,
        ];
    }
}
