<?php

namespace Tests\Feature;

use App\Models\Aluno;
use App\Models\Personal;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AlunoControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_listar_alunos_sendo_personal_retorna_apenas_vinculados()
    {
        $usuarioPersonal = Usuario::factory()->create();
        $personal = Personal::factory()->create(['usuario_id' => $usuarioPersonal->id]);

        $alunoVinculadoUser = Usuario::factory()->create();
        $alunoVinculado = Aluno::factory()->create(['usuario_id' => $alunoVinculadoUser->id]);

        $alunoNaoVinculadoUser = Usuario::factory()->create();
        $alunoNaoVinculado = Aluno::factory()->create(['usuario_id' => $alunoNaoVinculadoUser->id]);

        $personal->alunos()->attach($alunoVinculado, ['status' => 'ativo']);

        $resposta = $this->actingAs($usuarioPersonal, 'sanctum')->getJson('/api/aluno');

        $resposta->assertStatus(200);
        $this->assertCount(1, $resposta->json('data'));
        $this->assertEquals($alunoVinculado->id, $resposta->json('data.0.id'));
    }

    public function test_listar_alunos_sendo_aluno_retorna_ele_mesmo()
    {
        $usuarioAluno = Usuario::factory()->create();
        $aluno = Aluno::factory()->create(['usuario_id' => $usuarioAluno->id]);

        $outroUser = Usuario::factory()->create();
        Aluno::factory()->create(['usuario_id' => $outroUser->id]); // Outro aluno

        $resposta = $this->actingAs($usuarioAluno, 'sanctum')->getJson('/api/aluno');

        $resposta->assertStatus(200);
        $this->assertCount(1, $resposta->json('data'));
        $this->assertEquals($aluno->id, $resposta->json('data.0.id'));
    }

    public function test_exibir_aluno_permitido_para_o_proprio()
    {
        $usuarioAluno = Usuario::factory()->create();
        $aluno = Aluno::factory()->create(['usuario_id' => $usuarioAluno->id]);

        $resposta = $this->actingAs($usuarioAluno, 'sanctum')->getJson('/api/aluno/' . $aluno->id);

        $resposta->assertStatus(200)
            ->assertJsonPath('data.id', $aluno->id);
    }

    public function test_exibir_aluno_permitido_para_personal_vinculado()
    {
        $usuarioPersonal = Usuario::factory()->create();
        $personal = Personal::factory()->create(['usuario_id' => $usuarioPersonal->id]);

        $alunoUser = Usuario::factory()->create();
        $aluno = Aluno::factory()->create(['usuario_id' => $alunoUser->id]);
        $personal->alunos()->attach($aluno, ['status' => 'ativo']);

        $resposta = $this->actingAs($usuarioPersonal, 'sanctum')->getJson('/api/aluno/' . $aluno->id);

        $resposta->assertStatus(200)
            ->assertJsonPath('data.id', $aluno->id);
    }

    public function test_exibir_aluno_negado_para_personal_nao_vinculado()
    {
        $usuarioPersonal = Usuario::factory()->create();
        Personal::factory()->create(['usuario_id' => $usuarioPersonal->id]);

        $alunoUser = Usuario::factory()->create();
        $aluno = Aluno::factory()->create(['usuario_id' => $alunoUser->id]);

        $resposta = $this->actingAs($usuarioPersonal, 'sanctum')->getJson('/api/aluno/' . $aluno->id);

        $resposta->assertStatus(403);
    }

    public function test_atualizar_aluno_permitido_para_o_proprio()
    {
        $usuarioAluno = Usuario::factory()->create();
        $aluno = Aluno::factory()->create(['usuario_id' => $usuarioAluno->id]);

        $payload = [
            'peso' => 80.5,
            'altura' => 1.80
        ];

        $resposta = $this->actingAs($usuarioAluno, 'sanctum')->putJson('/api/aluno/' . $aluno->id, $payload);

        $resposta->assertStatus(200)
            ->assertJsonPath('data.dados_fisicos.peso', 80.5)
            ->assertJsonPath('data.dados_fisicos.altura', 1.80);

        $this->assertDatabaseHas('alunos', ['id' => $aluno->id, 'peso' => 80.5, 'altura' => 1.80]);
    }

    public function test_deletar_aluno_com_sucesso()
    {
        $usuarioAluno = Usuario::factory()->create();
        $aluno = Aluno::factory()->create(['usuario_id' => $usuarioAluno->id]);

        $resposta = $this->actingAs($usuarioAluno, 'sanctum')->deleteJson('/api/aluno/' . $aluno->id);

        $resposta->assertStatus(200);
        $this->assertSoftDeleted('alunos', ['id' => $aluno->id]);
        $this->assertDatabaseHas('alunos', ['id' => $aluno->id, 'ativo' => false]);
    }
}
