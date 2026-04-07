<?php

namespace Database\Seeders;

use App\Models\Aluno;
use App\Models\Usuario;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AlunoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Usuario::factory()
            ->count(3)
            ->create()
            ->each(function ($usuario) {
                Aluno::factory()->create([
                    'usuario_id' => $usuario->id,
                ]);
            });
    }
}
