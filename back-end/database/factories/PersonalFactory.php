<?php

namespace Database\Factories;

use App\Models\Personal;
use App\Models\Usuario;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Personal>
 */
class PersonalFactory extends Factory
{
    protected $model = Personal::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'usuario_id' => Usuario::factory(),
            'telefone' => $this->faker->phoneNumber(),
            'genero' => $this->faker->randomElement([
                'masculino',
                'feminino',
                'prefiro_nao_informar',
                'nao_binario',
                'outro'
            ])
        ];
    }
}
