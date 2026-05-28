<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Usuario;
use App\Models\Personal;
use App\Models\Aluno;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Personal
        $usuarioPersonal = Usuario::factory()->create([
            'nome' => 'Personal Trainer',
            'email' => 'personal@gogym.com',
            'senha' => bcrypt('1234'),
        ]);

        $personal = Personal::factory()->create([
            'usuario_id' => $usuarioPersonal->id,
        ]);

        // Alunos
        for ($i = 1; $i <= 3; $i++) {
            $usuarioAluno = Usuario::factory()->create([
                'nome' => "Aluno Teste 0{$i}",
                'email' => "aluno0{$i}@gogym.com",
                'senha' => bcrypt('1234'),
            ]);

            $aluno = Aluno::factory()->create([
                'usuario_id' => $usuarioAluno->id,
            ]);

            // Vincular ao personal
            $personal->alunos()->attach($aluno->id, ['status' => 'ativo']);
        }
    }
}
