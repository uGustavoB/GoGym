<?php

namespace Tests\Feature;

use App\Models\Aluno;
use App\Models\Exercicio;
use App\Models\FichaTreino;
use App\Models\Personal;
use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FichaTreinoControllerTest extends TestCase
{
    use RefreshDatabase;

    // ──────────────────────────────────────────────
    // Helpers
    // ──────────────────────────────────────────────

    private function criarPersonalComAluno(): array
    {
        $usuarioP = Usuario::factory()->create();
        $personal = Personal::factory()->create(['usuario_id' => $usuarioP->id]);
        $usuarioA = Usuario::factory()->create();
        $aluno    = Aluno::factory()->create(['usuario_id' => $usuarioA->id]);
        $personal->alunos()->attach($aluno, ['status' => 'ativo']);

        return compact('usuarioP', 'personal', 'usuarioA', 'aluno');
    }

    private function criarAlunoPuro(): array
    {
        $usuario = Usuario::factory()->create();
        $aluno   = Aluno::factory()->create(['usuario_id' => $usuario->id]);
        return compact('usuario', 'aluno');
    }

    private function exercicioGlobal(): Exercicio
    {
        return Exercicio::factory()->create(['personal_id' => null]);
    }

    private function payloadFicha(int $exercicioId, ?int $alunoId = null): array
    {
        $base = [
            'nome'        => 'Treino Controller Test',
            'data_inicio' => '2026-06-01',
            'semanas'     => [
                [
                    'numero_semana'   => 1,
                    'descricao_fase'  => 'Adaptação',
                    'repeticoes_alvo' => '12-15',
                ],
            ],
            'rotinas' => [
                [
                    'letra_nome' => 'A',
                    'exercicios' => [
                        [
                            'exercicio_id' => $exercicioId,
                            'ordem'        => 1,
                            'tipo_serie'   => 'trabalho',
                            'series'       => 3,
                        ],
                    ],
                ],
            ],
        ];

        if ($alunoId !== null) {
            $base['aluno_id'] = $alunoId;
        }

        return $base;
    }

    // ──────────────────────────────────────────────
    // CENÁRIO 1 — PERSONAL
    // ──────────────────────────────────────────────

    public function test_personal_pode_criar_ficha_para_aluno_vinculado(): void
    {
        ['usuarioP' => $usuarioP, 'personal' => $personal, 'aluno' => $aluno] = $this->criarPersonalComAluno();
        $exercicio = $this->exercicioGlobal();

        $resposta = $this->actingAs($usuarioP, 'sanctum')
            ->postJson('/api/ficha-treino', $this->payloadFicha($exercicio->id, $aluno->id));

        $resposta->assertStatus(201);
        $resposta->assertJsonPath('mensagem', 'Ficha de treino criada com sucesso.');
        $this->assertDatabaseHas('fichas_treinos', [
            'aluno_id' => $aluno->id,
            'nome'     => 'Treino Controller Test',
        ]);
        // personal_id deve ser preenchido automaticamente
        $ficha = FichaTreino::where('aluno_id', $aluno->id)->first();
        $this->assertNotNull($ficha->personal_id);
        $this->assertEquals($personal->id, $ficha->personal_id);
    }

    public function test_personal_nao_pode_criar_ficha_para_aluno_nao_vinculado(): void
    {
        ['usuarioP' => $usuarioP] = $this->criarPersonalComAluno();
        $exercicio = $this->exercicioGlobal();

        $usuarioOutro = Usuario::factory()->create();
        $alunoOutro   = Aluno::factory()->create(['usuario_id' => $usuarioOutro->id]);
        // alunoOutro NÃO está vinculado ao personal

        $resposta = $this->actingAs($usuarioP, 'sanctum')
            ->postJson('/api/ficha-treino', $this->payloadFicha($exercicio->id, $alunoOutro->id));

        $resposta->assertStatus(422);
        $resposta->assertJsonValidationErrorFor('aluno_id');
    }

    public function test_personal_lista_somente_suas_fichas(): void
    {
        ['usuarioP' => $usuarioP, 'personal' => $personal, 'aluno' => $aluno] = $this->criarPersonalComAluno();

        // Ficha do personal1
        FichaTreino::factory()->create(['personal_id' => $personal->id, 'aluno_id' => $aluno->id]);

        // Ficha de outro personal (não deve aparecer)
        $usuarioP2 = Usuario::factory()->create();
        $personal2 = Personal::factory()->create(['usuario_id' => $usuarioP2->id]);
        $usuarioA2 = Usuario::factory()->create();
        $aluno2    = Aluno::factory()->create(['usuario_id' => $usuarioA2->id]);
        FichaTreino::factory()->create(['personal_id' => $personal2->id, 'aluno_id' => $aluno2->id]);

        $resposta = $this->actingAs($usuarioP, 'sanctum')->getJson('/api/ficha-treino');

        $resposta->assertStatus(200);
        $this->assertCount(1, $resposta->json('data'));
    }

    public function test_personal_pode_atualizar_propria_ficha(): void
    {
        ['usuarioP' => $usuarioP, 'personal' => $personal, 'aluno' => $aluno] = $this->criarPersonalComAluno();
        $exercicio = $this->exercicioGlobal();
        $ficha = FichaTreino::factory()->create(['personal_id' => $personal->id, 'aluno_id' => $aluno->id]);

        $payload = array_merge(
            $this->payloadFicha($exercicio->id, $aluno->id),
            ['nome' => 'Ficha Atualizada']
        );

        $resposta = $this->actingAs($usuarioP, 'sanctum')
            ->putJson("/api/ficha-treino/{$ficha->id}", $payload);

        $resposta->assertStatus(200);
        $resposta->assertJsonPath('data.nome', 'Ficha Atualizada');
    }

    public function test_personal_nao_pode_reatribuir_ficha_a_aluno_nao_vinculado(): void
    {
        ['usuarioP' => $usuarioP, 'personal' => $personal, 'aluno' => $aluno] = $this->criarPersonalComAluno();
        $exercicio = $this->exercicioGlobal();
        $ficha = FichaTreino::factory()->create(['personal_id' => $personal->id, 'aluno_id' => $aluno->id]);

        $usuarioOutro = Usuario::factory()->create();
        $alunoOutro   = Aluno::factory()->create(['usuario_id' => $usuarioOutro->id]);
        // alunoOutro NÃO está vinculado ao personal

        $payload = $this->payloadFicha($exercicio->id, $alunoOutro->id);

        $resposta = $this->actingAs($usuarioP, 'sanctum')
            ->putJson("/api/ficha-treino/{$ficha->id}", $payload);

        $resposta->assertStatus(422);
        $resposta->assertJsonValidationErrorFor('aluno_id');
    }

    public function test_personal_nao_pode_atualizar_ficha_de_outro_personal(): void
    {
        ['usuarioP' => $usuarioP] = $this->criarPersonalComAluno();
        $exercicio = $this->exercicioGlobal();

        ['usuarioP' => $usuarioP2, 'personal' => $personal2, 'aluno' => $aluno2] = $this->criarPersonalComAluno();
        $fichaDoOutro = FichaTreino::factory()->create([
            'personal_id' => $personal2->id,
            'aluno_id'    => $aluno2->id,
        ]);

        $payload = $this->payloadFicha($exercicio->id, $aluno2->id);

        $resposta = $this->actingAs($usuarioP, 'sanctum')
            ->putJson("/api/ficha-treino/{$fichaDoOutro->id}", $payload);

        $resposta->assertStatus(403);
    }

    public function test_personal_pode_deletar_propria_ficha(): void
    {
        ['usuarioP' => $usuarioP, 'personal' => $personal, 'aluno' => $aluno] = $this->criarPersonalComAluno();
        $ficha = FichaTreino::factory()->create(['personal_id' => $personal->id, 'aluno_id' => $aluno->id]);

        $resposta = $this->actingAs($usuarioP, 'sanctum')
            ->deleteJson("/api/ficha-treino/{$ficha->id}");

        $resposta->assertStatus(200);
        $this->assertSoftDeleted('fichas_treinos', ['id' => $ficha->id]);
    }

    public function test_personal_nao_pode_deletar_ficha_de_outro_personal(): void
    {
        ['usuarioP' => $usuarioP] = $this->criarPersonalComAluno();

        ['personal' => $personal2, 'aluno' => $aluno2] = $this->criarPersonalComAluno();
        $fichaDoOutro = FichaTreino::factory()->create([
            'personal_id' => $personal2->id,
            'aluno_id'    => $aluno2->id,
        ]);

        $resposta = $this->actingAs($usuarioP, 'sanctum')
            ->deleteJson("/api/ficha-treino/{$fichaDoOutro->id}");

        $resposta->assertStatus(403);
    }

    // ──────────────────────────────────────────────
    // CENÁRIO 2 — ALUNO AUTÔNOMO (sem personal)
    // ──────────────────────────────────────────────

    public function test_aluno_pode_criar_propria_ficha_sem_informar_aluno_id(): void
    {
        ['usuario' => $usuario, 'aluno' => $aluno] = $this->criarAlunoPuro();
        $exercicio = $this->exercicioGlobal();

        // Aluno NÃO envia aluno_id
        $resposta = $this->actingAs($usuario, 'sanctum')
            ->postJson('/api/ficha-treino', $this->payloadFicha($exercicio->id));

        $resposta->assertStatus(201);
        $this->assertDatabaseHas('fichas_treinos', [
            'aluno_id'    => $aluno->id,
            'personal_id' => null,
        ]);
    }

    public function test_aluno_ve_fichas_do_personal_e_as_proprias(): void
    {
        ['usuarioP' => $usuarioP, 'personal' => $personal] = $this->criarPersonalComAluno();

        ['usuario' => $usuarioA, 'aluno' => $aluno] = $this->criarAlunoPuro();
        // Vincular o mesmo aluno ao personal para criar ficha
        $personal->alunos()->attach($aluno, ['status' => 'ativo']);

        // Ficha criada pelo personal para este aluno
        FichaTreino::factory()->create(['personal_id' => $personal->id, 'aluno_id' => $aluno->id]);
        // Ficha criada pelo próprio aluno
        FichaTreino::factory()->semPersonal()->create(['aluno_id' => $aluno->id]);

        $resposta = $this->actingAs($usuarioA, 'sanctum')->getJson('/api/ficha-treino');

        $resposta->assertStatus(200);
        $this->assertCount(2, $resposta->json('data'));
    }

    public function test_aluno_pode_ver_propria_ficha(): void
    {
        ['usuario' => $usuario, 'aluno' => $aluno] = $this->criarAlunoPuro();
        $ficha = FichaTreino::factory()->semPersonal()->create(['aluno_id' => $aluno->id]);

        $resposta = $this->actingAs($usuario, 'sanctum')
            ->getJson("/api/ficha-treino/{$ficha->id}");

        $resposta->assertStatus(200);
        $resposta->assertJsonPath('data.id', $ficha->id);
    }

    public function test_aluno_pode_atualizar_propria_ficha(): void
    {
        ['usuario' => $usuario, 'aluno' => $aluno] = $this->criarAlunoPuro();
        $ficha     = FichaTreino::factory()->semPersonal()->create(['aluno_id' => $aluno->id]);
        $exercicio = $this->exercicioGlobal();

        $payload = array_merge(
            $this->payloadFicha($exercicio->id),
            ['nome' => 'Meu Treino Atualizado']
        );

        $resposta = $this->actingAs($usuario, 'sanctum')
            ->putJson("/api/ficha-treino/{$ficha->id}", $payload);

        $resposta->assertStatus(200);
        $resposta->assertJsonPath('data.nome', 'Meu Treino Atualizado');
    }

    public function test_aluno_nao_pode_editar_ficha_criada_pelo_personal(): void
    {
        ['usuarioP' => $usuarioP, 'personal' => $personal] = $this->criarPersonalComAluno();
        ['usuario' => $usuarioA, 'aluno' => $aluno] = $this->criarAlunoPuro();
        $personal->alunos()->attach($aluno, ['status' => 'ativo']);

        $fichaDoPersonal = FichaTreino::factory()->create([
            'personal_id' => $personal->id,
            'aluno_id'    => $aluno->id,
        ]);
        $exercicio = $this->exercicioGlobal();

        $payload = $this->payloadFicha($exercicio->id);

        $resposta = $this->actingAs($usuarioA, 'sanctum')
            ->putJson("/api/ficha-treino/{$fichaDoPersonal->id}", $payload);

        $resposta->assertStatus(403);
    }

    public function test_aluno_pode_deletar_propria_ficha(): void
    {
        ['usuario' => $usuario, 'aluno' => $aluno] = $this->criarAlunoPuro();
        $ficha = FichaTreino::factory()->semPersonal()->create(['aluno_id' => $aluno->id]);

        $resposta = $this->actingAs($usuario, 'sanctum')
            ->deleteJson("/api/ficha-treino/{$ficha->id}");

        $resposta->assertStatus(200);
        $this->assertSoftDeleted('fichas_treinos', ['id' => $ficha->id]);
    }

    public function test_aluno_nao_pode_deletar_ficha_do_personal(): void
    {
        ['usuarioP' => $usuarioP, 'personal' => $personal] = $this->criarPersonalComAluno();
        ['usuario' => $usuarioA, 'aluno' => $aluno] = $this->criarAlunoPuro();
        $personal->alunos()->attach($aluno, ['status' => 'ativo']);

        $fichaDoPersonal = FichaTreino::factory()->create([
            'personal_id' => $personal->id,
            'aluno_id'    => $aluno->id,
        ]);

        $resposta = $this->actingAs($usuarioA, 'sanctum')
            ->deleteJson("/api/ficha-treino/{$fichaDoPersonal->id}");

        $resposta->assertStatus(403);
    }

    // ──────────────────────────────────────────────
    // SEGURANÇA
    // ──────────────────────────────────────────────

    public function test_usuario_sem_perfil_nao_acessa_fichas(): void
    {
        $usuario = Usuario::factory()->create();
        // sem personal nem aluno

        $resposta = $this->actingAs($usuario, 'sanctum')->getJson('/api/ficha-treino');
        $resposta->assertStatus(403);
    }

    public function test_usuario_nao_autenticado_recebe_401(): void
    {
        $resposta = $this->getJson('/api/ficha-treino');
        $resposta->assertStatus(401);
    }
}
