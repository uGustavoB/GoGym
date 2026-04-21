<?php

namespace Tests\Feature;

use App\Models\Aluno;
use App\Models\Convite;
use App\Models\Personal;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class AutenticacaoControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_registrar_personal_com_sucesso()
    {
        $payload = [
            'nome' => 'Novo Personal',
            'email' => 'personal@teste.com',
            'senha' => 'senha123',
            'telefone' => '11999999999',
            'genero' => 'masculino',
        ];

        $resposta = $this->postJson('/api/registrar/personal', $payload);

        $resposta->assertStatus(201)
            ->assertJsonStructure(['mensagem', 'dados', 'token']);

        $this->assertDatabaseHas('usuarios', ['email' => 'personal@teste.com']);
        $this->assertDatabaseHas('personais', ['telefone' => '11999999999']);
    }

    public function test_registrar_personal_com_falha_de_validacao()
    {
        $payload = [
            'nome' => 'Novo Personal',
            // email faltando
        ];

        $resposta = $this->postJson('/api/registrar/personal', $payload);

        $resposta->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'senha', 'telefone', 'genero']);
    }

    public function test_registrar_aluno_com_sucesso()
    {
        $payload = [
            'nome' => 'Novo Aluno',
            'email' => 'aluno@teste.com',
            'senha' => 'senha123',
            'telefone' => '11888888888',
        ];

        $resposta = $this->postJson('/api/registrar/aluno', $payload);

        $resposta->assertStatus(201)
            ->assertJsonStructure(['mensagem', 'dados', 'token']);

        $this->assertDatabaseHas('usuarios', ['email' => 'aluno@teste.com']);
        $this->assertDatabaseHas('alunos', ['telefone' => '11888888888']);
    }

    public function test_registrar_aluno_com_convite()
    {
        $personalUser = Usuario::factory()->create();
        $personal = Personal::factory()->create(['usuario_id' => $personalUser->id]);

        $convite = Convite::create([
            'personal_id' => $personal->id,
            'email' => 'aluno.convidado@teste.com',
            'token' => 'token-valido',
            'status' => 'pendente'
        ]);

        $payload = [
            'nome' => 'Novo Aluno',
            'email' => 'aluno.convidado@teste.com',
            'senha' => 'senha123',
            'telefone' => '11888888888',
            'token_convite' => 'token-valido'
        ];

        $resposta = $this->postJson('/api/registrar/aluno', $payload);

        $resposta->assertStatus(201);

        $usuarioAluno = Usuario::where('email', 'aluno.convidado@teste.com')->first();
        $this->assertDatabaseHas('aluno_personal', [
            'aluno_id' => $usuarioAluno->aluno->id,
            'personal_id' => $personal->id,
            'status' => 'ativo'
        ]);

        $this->assertDatabaseHas('convites', [
            'id' => $convite->id,
            'status' => 'aceito'
        ]);
    }

    public function test_login_com_sucesso()
    {
        $usuario = Usuario::factory()->create([
            'senha' => Hash::make('senha123')
        ]);

        $resposta = $this->postJson('/api/login', [
            'email' => $usuario->email,
            'senha' => 'senha123'
        ]);

        $resposta->assertStatus(200)
            ->assertJsonStructure(['usuario', 'token']);
    }

    public function test_login_com_credenciais_invalidas()
    {
        $resposta = $this->postJson('/api/login', [
            'email' => 'naoexiste@teste.com',
            'senha' => 'errada'
        ]);

        $resposta->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_perfil_com_sucesso()
    {
        $usuario = Usuario::factory()->create();
        $personal = Personal::factory()->create(['usuario_id' => $usuario->id]);

        $resposta = $this->actingAs($usuario, 'sanctum')->getJson('/api/perfil');

        $resposta->assertStatus(200)
            ->assertJsonPath('usuario.id', $usuario->id)
            ->assertJsonPath('tipo_perfil', 'personal');
    }

    public function test_perfil_nao_autenticado()
    {
        $resposta = $this->getJson('/api/perfil');
        $resposta->assertStatus(401);
    }

    public function test_sair_com_sucesso()
    {
        $usuario = Usuario::factory()->create();
        $token = $usuario->createToken('teste')->plainTextToken;

        $resposta = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token,
        ])->postJson('/api/sair');

        $resposta->assertStatus(200);
        $this->assertCount(0, $usuario->fresh()->tokens);
    }

    public function test_esqueci_senha_valida()
    {
        Notification::fake();

        $usuario = Usuario::factory()->create();

        $resposta = $this->postJson('/api/esqueci-senha', [
            'email' => $usuario->email
        ]);

        $resposta->assertStatus(200);
        $this->assertDatabaseHas('password_reset_tokens', ['email' => $usuario->email]);
    }

    public function test_redefinir_senha_valida()
    {
        $usuario = Usuario::factory()->create();

        DB::table('password_reset_tokens')->insert([
            'email' => $usuario->email,
            'token' => Hash::make('token-reset-123'),
            'created_at' => now()
        ]);

        $resposta = $this->postJson('/api/redefinir-senha', [
            'email' => $usuario->email,
            'token' => 'token-reset-123',
            'senha' => 'nova_senha123',
            'senha_confirmation' => 'nova_senha123'
        ]);

        $resposta->assertStatus(200);
        $this->assertTrue(Hash::check('nova_senha123', $usuario->fresh()->senha));
        $this->assertDatabaseMissing('password_reset_tokens', ['email' => $usuario->email]);
    }
}
