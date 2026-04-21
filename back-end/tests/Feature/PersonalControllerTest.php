<?php

namespace Tests\Feature;

use App\Models\Personal;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class PersonalControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_listar_personais_com_sucesso()
    {
        $usuarioLogado = Usuario::factory()->create();
        Personal::factory()->count(3)->create();

        $resposta = $this->actingAs($usuarioLogado, 'sanctum')->getJson('/api/personal');

        $resposta->assertStatus(200)
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'usuario_id', 'telefone', 'genero']
                ],
                'links',
                'meta'
            ]);
    }

    public function test_listar_personais_nao_autenticado()
    {
        $resposta = $this->getJson('/api/personal');
        $resposta->assertStatus(401);
    }

    public function test_listar_personais_email_nao_verificado()
    {
        $usuario = Usuario::factory()->unverified()->create();

        $resposta = $this->actingAs($usuario, 'sanctum')->getJson('/api/personal');
        $resposta->assertStatus(403);
    }

    public function test_exibir_personal_com_sucesso()
    {
        $usuarioLogado = Usuario::factory()->create();
        $personal = Personal::factory()->create();

        $resposta = $this->actingAs($usuarioLogado, 'sanctum')->getJson('/api/personal/' . $personal->id);

        $resposta->assertStatus(200)
            ->assertJsonPath('data.id', $personal->id);
    }

    public function test_exibir_personal_nao_encontrado()
    {
        $usuarioLogado = Usuario::factory()->create();

        $resposta = $this->actingAs($usuarioLogado, 'sanctum')->getJson('/api/personal/999');

        $resposta->assertStatus(404);
    }

    public function test_atualizar_personal_com_sucesso()
    {
        $usuarioLogado = Usuario::factory()->create();
        $personal = Personal::factory()->create();

        $payload = [
            'telefone' => '11777777777',
            'genero' => 'outro'
        ];

        $resposta = $this->actingAs($usuarioLogado, 'sanctum')->putJson('/api/personal/' . $personal->id, $payload);

        $resposta->assertStatus(200)
            ->assertJsonPath('data.telefone', '11777777777')
            ->assertJsonPath('data.genero', 'outro');

        $this->assertDatabaseHas('personais', ['id' => $personal->id, 'telefone' => '11777777777', 'genero' => 'outro']);
    }

    public function test_deletar_personal_com_sucesso()
    {
        $usuarioLogado = Usuario::factory()->create();
        $personal = Personal::factory()->create();

        $resposta = $this->actingAs($usuarioLogado, 'sanctum')->deleteJson('/api/personal/' . $personal->id);

        $resposta->assertStatus(200);
        $this->assertSoftDeleted('personais', ['id' => $personal->id]);
    }

    public function test_gerar_convite_com_sucesso()
    {
        Notification::fake();

        $usuario = Usuario::factory()->create();
        Personal::factory()->create(['usuario_id' => $usuario->id]);

        $payload = [
            'nome' => 'Novo Aluno Convidado',
            'email' => 'aluno@teste.com'
        ];

        $resposta = $this->actingAs($usuario, 'sanctum')->postJson('/api/personal/gerar-convite', $payload);

        $resposta->assertStatus(200)
            ->assertJsonStructure([
                'mensagem',
                'convite' => ['email', 'token', 'status']
            ]);

        $this->assertDatabaseHas('convites', [
            'email' => 'aluno@teste.com',
            'status' => 'pendente'
        ]);
    }
}
