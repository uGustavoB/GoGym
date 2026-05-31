<?php

namespace Tests\Feature;

use App\Models\Aluno;
use App\Models\Exercicio;
use App\Models\FichaTreino;
use App\Models\Personal;
use App\Models\Usuario;
use App\Services\FichaTreinoService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FichaTreinoServiceTest extends TestCase
{
    use RefreshDatabase;

    private FichaTreinoService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = app(FichaTreinoService::class);
    }

    private function payloadBase(int $exercicioId): array
    {
        return [
            'nome'        => 'Treino Teste',
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
    }

    public function test_criar_ficha_como_personal_define_personal_id_e_aluno_id(): void
    {
        $usuarioP = Usuario::factory()->create();
        $personal = Personal::factory()->create(['usuario_id' => $usuarioP->id]);
        $usuarioA = Usuario::factory()->create();
        $aluno    = Aluno::factory()->create(['usuario_id' => $usuarioA->id]);
        $exercicio = Exercicio::factory()->create(['personal_id' => null]);

        $dados = array_merge($this->payloadBase($exercicio->id), ['aluno_id' => $aluno->id]);

        $this->actingAs($usuarioP, 'sanctum');
        $ficha = $this->service->criar($dados, $usuarioP);

        $this->assertEquals($personal->id, $ficha->personal_id);
        $this->assertEquals($aluno->id, $ficha->aluno_id);
    }

    public function test_criar_ficha_como_aluno_define_aluno_id_e_personal_id_nulo(): void
    {
        $usuarioA  = Usuario::factory()->create();
        $aluno     = Aluno::factory()->create(['usuario_id' => $usuarioA->id]);
        $exercicio = Exercicio::factory()->create(['personal_id' => null]);

        $dados = $this->payloadBase($exercicio->id);
        // Aluno NÃO envia aluno_id (auto-assign no service)

        $this->actingAs($usuarioA, 'sanctum');
        $ficha = $this->service->criar($dados, $usuarioA);

        $this->assertNull($ficha->personal_id);
        $this->assertEquals($aluno->id, $ficha->aluno_id);
    }

    public function test_listar_como_personal_retorna_somente_suas_fichas(): void
    {
        $usuarioP1 = Usuario::factory()->create();
        $personal1 = Personal::factory()->create(['usuario_id' => $usuarioP1->id]);
        $usuarioP2 = Usuario::factory()->create();
        $personal2 = Personal::factory()->create(['usuario_id' => $usuarioP2->id]);
        $usuarioA  = Usuario::factory()->create();
        $aluno     = Aluno::factory()->create(['usuario_id' => $usuarioA->id]);

        FichaTreino::factory()->create(['personal_id' => $personal1->id, 'aluno_id' => $aluno->id]);
        FichaTreino::factory()->create(['personal_id' => $personal2->id, 'aluno_id' => $aluno->id]);

        $this->actingAs($usuarioP1, 'sanctum');
        $resultado = $this->service->listar($usuarioP1);

        $this->assertEquals(1, $resultado->total());
        $this->assertEquals($personal1->id, $resultado->items()[0]->personal_id);
    }

    public function test_listar_como_aluno_retorna_todas_as_fichas_vinculadas_a_ele(): void
    {
        $usuarioP = Usuario::factory()->create();
        $personal = Personal::factory()->create(['usuario_id' => $usuarioP->id]);
        $usuarioA = Usuario::factory()->create();
        $aluno    = Aluno::factory()->create(['usuario_id' => $usuarioA->id]);

        // Ficha do personal para o aluno
        FichaTreino::factory()->create(['personal_id' => $personal->id, 'aluno_id' => $aluno->id]);
        // Ficha criada pelo próprio aluno
        FichaTreino::factory()->create(['personal_id' => null, 'aluno_id' => $aluno->id]);

        $this->actingAs($usuarioA, 'sanctum');
        $resultado = $this->service->listar($usuarioA);

        $this->assertEquals(2, $resultado->total());
    }
}
