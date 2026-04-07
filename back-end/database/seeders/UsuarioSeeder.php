<?php

namespace Database\Seeders;

use App\Models\Personal;
use App\Models\Usuario;
use Hash;
use Illuminate\Database\Seeder;

class UsuarioSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
//      Usuário admin
        Usuario::create([
            'nome' => 'Admin',
            'email' => 'admin@example.com',
            'senha' => Hash::make('1234'),
            'data_verificacao_email' => now(),
        ]);

//      Usuários que são personais
        Usuario::factory()
            ->count(3)
            ->create()
            ->each(function ($usuario) {
                Personal::factory()->create([
                    'usuario_id' => $usuario->id
                ]);
            });
    }
}
