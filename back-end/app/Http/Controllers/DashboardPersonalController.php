<?php

namespace App\Http\Controllers;

use App\Http\Resources\DashboardPersonalResumoResource;
use App\Http\Resources\ProgressoAlunoResource;
use App\Models\Aluno;
use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class DashboardPersonalController extends Controller
{
    public function __construct(
        private DashboardService $servico
    ) {}

    #[OA\Get(
        path: '/dashboard/personal/resumo',
        description: 'Retorna estatísticas gerais dos alunos ativos do personal trainer logado.',
        summary: 'Resumo geral do Personal Trainer',
        security: [['sanctum' => []]],
        tags: ['Dashboard - Personal'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Resumo do dashboard',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: 'data',
                            properties: [
                                new OA\Property(property: 'total_alunos_ativos', type: 'integer', example: 10),
                                new OA\Property(
                                    property: 'adesao_semanal',
                                    properties: [
                                        new OA\Property(property: 'sessoes_planejadas', type: 'integer', example: 25),
                                        new OA\Property(property: 'sessoes_concluidas', type: 'integer', example: 20),
                                        new OA\Property(property: 'taxa_percentual', type: 'number', format: 'float', example: 80.0)
                                    ],
                                    type: 'object'
                                ),
                                new OA\Property(property: 'media_esforco_global', type: 'number', format: 'float', example: 7.5),
                                new OA\Property(
                                    property: 'top_frequentes',
                                    type: 'array',
                                    items: new OA\Items(
                                        properties: [
                                            new OA\Property(property: 'aluno_id', type: 'integer', example: 1),
                                            new OA\Property(property: 'nome', type: 'string', example: 'João Silva'),
                                            new OA\Property(property: 'sessoes', type: 'integer', example: 12)
                                        ],
                                        type: 'object'
                                    )
                                ),
                                new OA\Property(
                                    property: 'menos_frequentes',
                                    type: 'array',
                                    items: new OA\Items(
                                        properties: [
                                            new OA\Property(property: 'aluno_id', type: 'integer', example: 2),
                                            new OA\Property(property: 'nome', type: 'string', example: 'Maria Souza'),
                                            new OA\Property(property: 'sessoes', type: 'integer', example: 2)
                                        ],
                                        type: 'object'
                                    )
                                )
                            ],
                            type: 'object'
                        )
                    ],
                    type: 'object'
                )
            ),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Acesso negado - Utilizador não é um personal trainer')
        ]
    )]
    public function resumo(Request $request): JsonResponse
    {
        $personal = $request->user()->personal;

        if (! $personal) {
            return response()->json([
                'mensagem' => 'Utilizador não é um personal trainer.',
            ], 403);
        }

        $dados = $this->servico->resumoPersonal($personal->id);

        return response()->json([
            'data' => new DashboardPersonalResumoResource((object) $dados),
        ]);
    }

    #[OA\Get(
        path: '/dashboard/personal/aluno/{aluno}/progresso',
        description: 'Retorna as métricas de progresso e volume de carga de um aluno, filtradas por período.',
        summary: 'Progresso de um Aluno específico',
        security: [['sanctum' => []]],
        tags: ['Dashboard - Personal'],
        parameters: [
            new OA\Parameter(
                name: 'aluno',
                description: 'ID do Aluno',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer')
            ),
            new OA\Parameter(
                name: 'period',
                description: 'Período para filtro dos dados',
                in: 'query',
                required: false,
                schema: new OA\Schema(type: 'string', default: '30d', enum: ['7d', '30d', '3m', '6m', '1y', 'all'])
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Progresso do aluno',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: 'data',
                            properties: [
                                new OA\Property(property: 'periodo', type: 'string', example: '30d'),
                                new OA\Property(
                                    property: 'volume_load_semanal',
                                    type: 'array',
                                    items: new OA\Items(
                                        properties: [
                                            new OA\Property(property: 'semana', type: 'string', example: '2023-W42'),
                                            new OA\Property(property: 'inicio_semana', type: 'string', format: 'date', example: '2023-10-16'),
                                            new OA\Property(property: 'volume_load', type: 'number', format: 'float', example: 12500.5)
                                        ],
                                        type: 'object'
                                    )
                                ),
                                new OA\Property(
                                    property: 'carga_maxima_por_exercicio',
                                    type: 'array',
                                    items: new OA\Items(
                                        properties: [
                                            new OA\Property(property: 'exercicio_id', type: 'integer', example: 1),
                                            new OA\Property(property: 'exercicio_nome', type: 'string', example: 'Supino Reto'),
                                            new OA\Property(
                                                property: 'evolucao',
                                                type: 'array',
                                                items: new OA\Items(
                                                    properties: [
                                                        new OA\Property(property: 'semana', type: 'string', example: '2023-W42'),
                                                        new OA\Property(property: 'carga_maxima', type: 'number', format: 'float', example: 80.0)
                                                    ],
                                                    type: 'object'
                                                )
                                            )
                                        ],
                                        type: 'object'
                                    )
                                ),
                                new OA\Property(
                                    property: 'esforco_por_sessao',
                                    type: 'array',
                                    items: new OA\Items(
                                        properties: [
                                            new OA\Property(property: 'data', type: 'string', format: 'date', example: '2023-10-16'),
                                            new OA\Property(property: 'esforco_percebido', type: 'integer', example: 8),
                                            new OA\Property(property: 'duracao_minutos', type: 'integer', example: 60)
                                        ],
                                        type: 'object'
                                    )
                                ),
                                new OA\Property(
                                    property: 'frequencia_semanal',
                                    type: 'array',
                                    items: new OA\Items(
                                        properties: [
                                            new OA\Property(property: 'semana', type: 'string', example: '2023-W42'),
                                            new OA\Property(property: 'sessoes', type: 'integer', example: 4),
                                            new OA\Property(property: 'duracao_media', type: 'number', format: 'float', example: 55.5)
                                        ],
                                        type: 'object'
                                    )
                                )
                            ],
                            type: 'object'
                        )
                    ],
                    type: 'object'
                )
            ),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Acesso negado - Utilizador não é um personal trainer ou aluno não vinculado'),
            new OA\Response(response: 404, description: 'Aluno não encontrado')
        ]
    )]
    public function progressoAluno(Request $request, Aluno $aluno): JsonResponse
    {
        $personal = $request->user()->personal;

        if (! $personal) {
            return response()->json([
                'mensagem' => 'Utilizador não é um personal trainer.',
            ], 403);
        }

        // Verificar que o aluno pertence ao personal
        $vinculoExiste = $personal->alunos()
            ->where('alunos.id', $aluno->id)
            ->wherePivot('status', 'ativo')
            ->exists();

        if (! $vinculoExiste) {
            return response()->json([
                'mensagem' => 'Este aluno não está vinculado a você.',
            ], 403);
        }

        $period = $request->query('period', '30d');
        $dados = $this->servico->progressoAluno($aluno->id, $period);

        return response()->json([
            'data' => new ProgressoAlunoResource((object) $dados),
        ]);
    }
}
