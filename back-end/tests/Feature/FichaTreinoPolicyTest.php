<?php

namespace Tests\Feature;

use App\Models\Aluno;
use App\Models\FichaTreino;
use App\Models\Personal;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FichaTreinoPolicyTest extends TestCase
{
    use RefreshDatabase;

    // --- viewAny ---

    public function test_personal_pode_listar_fichas(): void
    {
        $usuario = Usuario::factory()->create();
        Personal::factory()->create(['usuario_id' => $usuario->id]);

        $resposta = $this->actingAs($usuario, 'sanctum')->getJson('/api/ficha-treino');
        $resposta->assertStatus(200);
    }

    public function test_aluno_pode_listar_fichas(): void
    {
        $usuario = Usuario::factory()->create();
        Aluno::factory()->create(['usuario_id' => $usuario->id]);

        $resposta = $this->actingAs($usuario, 'sanctum')->getJson('/api/ficha-treino');
        $resposta->assertStatus(200);
    }

    public function test_usuario_sem_perfil_nao_pode_listar_fichas(): void
    {
        $usuario = Usuario::factory()->create();
        // sem personal nem aluno

        $resposta = $this->actingAs($usuario, 'sanctum')->getJson('/api/ficha-treino');
        $resposta->assertStatus(403);
    }

    // --- view (show) ---

    public function test_personal_pode_ver_propria_ficha(): void
    {
        $usuarioP = Usuario::factory()->create();
        $personal = Personal::factory()->create(['usuario_id' => $usuarioP->id]);
        $usuarioA = Usuario::factory()->create();
        $aluno = Aluno::factory()->create(['usuario_id' => $usuarioA->id]);
        $ficha = FichaTreino::factory()->create([
            'personal_id' => $personal->id,
            'aluno_id'    => $aluno->id,
        ]);

        $resposta = $this->actingAs($usuarioP, 'sanctum')
            ->getJson("/api/ficha-treino/{$ficha->id}");
        $resposta->assertStatus(200);
    }

    public function test_personal_nao_pode_ver_ficha_de_outro_personal(): void
    {
        $usuario1 = Usuario::factory()->create();
        Personal::factory()->create(['usuario_id' => $usuario1->id]);

        $usuario2 = Usuario::factory()->create();
        $personal2 = Personal::factory()->create(['usuario_id' => $usuario2->id]);
        $usuarioA = Usuario::factory()->create();
        $aluno = Aluno::factory()->create(['usuario_id' => $usuarioA->id]);
        $fichaDoOutro = FichaTreino::factory()->create([
            'personal_id' => $personal2->id,
            'aluno_id'    => $aluno->id,
        ]);

        $resposta = $this->actingAs($usuario1, 'sanctum')
            ->getJson("/api/ficha-treino/{$fichaDoOutro->id}");
        $resposta->assertStatus(403);
    }

    public function test_aluno_pode_ver_ficha_vinculada_a_ele(): void
    {
        $usuarioP = Usuario::factory()->create();
        $personal = Personal::factory()->create(['usuario_id' => $usuarioP->id]);
        $usuarioA = Usuario::factory()->create();
        $aluno = Aluno::factory()->create(['usuario_id' => $usuarioA->id]);
        $ficha = FichaTreino::factory()->create([
            'personal_id' => $personal->id,
            'aluno_id'    => $aluno->id,
        ]);

        $resposta = $this->actingAs($usuarioA, 'sanctum')
            ->getJson("/api/ficha-treino/{$ficha->id}");
        $resposta->assertStatus(200);
    }

    // --- update ---

    public function test_aluno_nao_pode_editar_ficha_criada_pelo_personal(): void
    {
        $usuarioP = Usuario::factory()->create();
        $personal = Personal::factory()->create(['usuario_id' => $usuarioP->id]);
        $usuarioA = Usuario::factory()->create();
        $aluno = Aluno::factory()->create(['usuario_id' => $usuarioA->id]);
        $fichaDoPersonal = FichaTreino::factory()->create([
            'personal_id' => $personal->id,
            'aluno_id'    => $aluno->id,
        ]);

        $resposta = $this->actingAs($usuarioA, 'sanctum')
            ->putJson("/api/ficha-treino/{$fichaDoPersonal->id}", [
                'nome' => 'Tentativa',
                'data_inicio' => '2026-06-01',
                'semanas' => [],
                'rotinas' => [],
            ]);
        $resposta->assertStatus(403);
    }

    public function test_aluno_pode_editar_ficha_que_ele_mesmo_criou(): void
    {
        $usuarioA = Usuario::factory()->create();
        $aluno = Aluno::factory()->create(['usuario_id' => $usuarioA->id]);
        $fichaDoAluno = FichaTreino::factory()->create([
            'personal_id' => null,
            'aluno_id'    => $aluno->id,
        ]);
        $exercicio = \App\Models\Exercicio::factory()->create(['personal_id' => null]);

        $payload = [
            'nome'        => 'Atualizado',
            'data_inicio' => '2026-06-01',
            'semanas'     => [
                [
                    'numero_semana'   => 1,
                    'descricao_fase'  => 'Fase 1',
                    'repeticoes_alvo' => '10-12',
                ],
            ],
            'rotinas' => [
                [
                    'letra_nome' => 'A',
                    'exercicios' => [
                        [
                            'exercicio_id' => $exercicio->id,
                            'ordem'        => 1,
                            'tipo_serie'   => 'trabalho',
                            'series'       => 3,
                        ],
                    ],
                ],
            ],
        ];

        $resposta = $this->actingAs($usuarioA, 'sanctum')
            ->putJson("/api/ficha-treino/{$fichaDoAluno->id}", $payload);
        $resposta->assertStatus(200);
        $resposta->assertJsonPath('data.nome', 'Atualizado');
    }

    // --- policy invocation direta ---

    public function test_policy_e_invocada_diretamente(): void
    {
        // Personal - podeAcessar sua própria ficha
        $usuarioP = Usuario::factory()->create();
        $personal = Personal::factory()->create(['usuario_id' => $usuarioP->id]);
        $usuarioA = Usuario::factory()->create();
        $aluno = Aluno::factory()->create(['usuario_id' => $usuarioA->id]);
        $ficha = FichaTreino::factory()->create([
            'personal_id' => $personal->id,
            'aluno_id' => $aluno->id,
        ]);

        // Confirm direct Policy invocation returns correct booleans
        $this->assertTrue($usuarioP->can('view', $ficha));
        $this->assertFalse($usuarioA->can('update', $ficha)); // aluno cannot update personal's ficha
        $this->assertTrue($usuarioA->can('view', $ficha)); // aluno can view ficha linked to them
    }

    // --- delete ---

    public function test_personal_pode_deletar_propria_ficha(): void
    {
        $usuarioP = Usuario::factory()->create();
        $personal = Personal::factory()->create(['usuario_id' => $usuarioP->id]);
        $usuarioA = Usuario::factory()->create();
        $aluno = Aluno::factory()->create(['usuario_id' => $usuarioA->id]);
        $ficha = FichaTreino::factory()->create([
            'personal_id' => $personal->id,
            'aluno_id' => $aluno->id,
        ]);

        $resposta = $this->actingAs($usuarioP, 'sanctum')
            ->deleteJson("/api/ficha-treino/{$ficha->id}");
        // 200 (delete works) OR 403 (blocked by something else) — just not 500
        // Note: Controller authorize() added in Task 6 will make this 200 definitively
        $resposta->assertStatus(200);
    }

    public function test_aluno_nao_pode_deletar_ficha_do_personal(): void
    {
        $usuarioP = Usuario::factory()->create();
        $personal = Personal::factory()->create(['usuario_id' => $usuarioP->id]);
        $usuarioA = Usuario::factory()->create();
        $aluno = Aluno::factory()->create(['usuario_id' => $usuarioA->id]);
        $fichaDoPersonal = FichaTreino::factory()->create([
            'personal_id' => $personal->id,
            'aluno_id' => $aluno->id,
        ]);

        $resposta = $this->actingAs($usuarioA, 'sanctum')
            ->deleteJson("/api/ficha-treino/{$fichaDoPersonal->id}");
        $resposta->assertStatus(403);
    }

    public function test_aluno_pode_deletar_propria_ficha(): void
    {
        $usuarioA = Usuario::factory()->create();
        $aluno = Aluno::factory()->create(['usuario_id' => $usuarioA->id]);
        $fichaDoAluno = FichaTreino::factory()->create([
            'personal_id' => null,
            'aluno_id' => $aluno->id,
        ]);

        $resposta = $this->actingAs($usuarioA, 'sanctum')
            ->deleteJson("/api/ficha-treino/{$fichaDoAluno->id}");
        // Will be 200 after Controller is updated in Task 6
        $resposta->assertStatus(200);
    }
}
