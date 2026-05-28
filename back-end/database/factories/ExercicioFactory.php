<?php

namespace Database\Factories;

use App\Models\Exercicio;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Exercicio>
 */
class ExercicioFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'personal_id' => null,
            'nome' => $this->faker->words(3, true),
            'tipo' => $this->faker->randomElement(['superior', 'inferior', 'core', 'cardio', 'full_body']),
            'grupo_muscular' => $this->faker->randomElement(['peitoral', 'costas', 'ombros', 'biceps', 'triceps', 'quadriceps', 'posterior_coxa', 'gluteos', 'panturrilhas', 'abdomen', 'outro']),
            'video_url' => null,
            'instrucoes' => $this->faker->sentence(),
        ];
    }
}
