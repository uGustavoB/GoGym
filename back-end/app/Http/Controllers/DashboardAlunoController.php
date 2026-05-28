<?php

namespace App\Http\Controllers;

use App\Http\Resources\DashboardAlunoResumoResource;
use App\Http\Resources\HistoricoExercicioResource;
use App\Models\Exercicio;
use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class DashboardAlunoController extends Controller
{
    public function __construct(
        private DashboardService $servico
    ) {}

    #[OA\Get(
        path: '/dashboard/aluno/resumo',
        description: 'Retorna as métricas de resumo da própria conta do aluno logado.',
        summary: 'Resumo geral do Aluno',
        security: [['sanctum' => []]],
        tags: ['Dashboard - Aluno'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Resumo do dashboard do aluno',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: 'data',
                            properties: [
                                new OA\Property(property: 'total_sessoes', type: 'integer', example: 45),
                                new OA\Property(property: 'media_duracao_minutos', type: 'number', format: 'float', example: 58.5),
                                new OA\Property(property: 'media_esforco', type: 'number', format: 'float', example: 7.2),
                                new OA\Property(property: 'ultima_sessao', type: 'string', format: 'date', example: '2023-10-18'),
                                new OA\Property(property: 'sequencia_dias', type: 'integer', example: 3),
                                new OA\Property(property: 'melhor_sequencia', type: 'integer', example: 12)
                            ],
                            type: 'object'
                        )
                    ],
                    type: 'object'
                )
            ),
            new OA\Response(response: 401, description: 'Não autenticado'),
            new OA\Response(response: 403, description: 'Acesso negado - Utilizador não é um aluno')
        ]
    )]
    public function resumo(Request $request): JsonResponse
    {
        $aluno = $request->user()->aluno;

        if (! $aluno) {
            return response()->json([
                'mensagem' => 'Utilizador não é um aluno.',
            ], 403);
        }

        $dados = $this->servico->resumoAluno($aluno->id);

        return response()->json([
            'data' => new DashboardAlunoResumoResource((object) $dados),
        ]);
    }

    #[OA\Get(
        path: '/dashboard/aluno/exercicio/{exercicio}/historico',
        description: 'Retorna o histórico de cargas e volume de um exercício específico executado pelo aluno, filtrado por período.',
        summary: 'Histórico de um Exercício',
        security: [['sanctum' => []]],
        tags: ['Dashboard - Aluno'],
        parameters: [
            new OA\Parameter(
                name: 'exercicio',
                description: 'ID do Exercício',
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
                description: 'Histórico do exercício',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: 'data',
                            properties: [
                                new OA\Property(
                                    property: 'exercicio',
                                    properties: [
                                        new OA\Property(property: 'id', type: 'integer', example: 1),
                                        new OA\Property(property: 'nome', type: 'string', example: 'Agachamento Livre')
                                    ],
                                    type: 'object',
                                    nullable: true
                                ),
                                new OA\Property(property: 'periodo', type: 'string', example: '30d'),
                                new OA\Property(
                                    property: 'historico',
                                    type: 'array',
                                    items: new OA\Items(
                                        properties: [
                                            new OA\Property(property: 'data', type: 'string', format: 'date', example: '2023-10-18'),
                                            new OA\Property(
                                                property: 'series',
                                                type: 'array',
                                                items: new OA\Items(
                                                    properties: [
                                                        new OA\Property(property: 'numero_serie', type: 'integer', example: 1),
                                                        new OA\Property(property: 'repeticoes', type: 'integer', example: 12),
                                                        new OA\Property(property: 'carga', type: 'number', format: 'float', example: 40.0)
                                                    ],
                                                    type: 'object'
                                                )
                                            ),
                                            new OA\Property(property: 'carga_maxima', type: 'number', format: 'float', example: 45.0),
                                            new OA\Property(property: 'volume_sessao', type: 'number', format: 'float', example: 1500.0)
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
            new OA\Response(response: 403, description: 'Acesso negado - Utilizador não é um aluno'),
            new OA\Response(response: 404, description: 'Exercício não encontrado')
        ]
    )]
    public function historicoExercicio(Request $request, Exercicio $exercicio): JsonResponse
    {
        $aluno = $request->user()->aluno;

        if (! $aluno) {
            return response()->json([
                'mensagem' => 'Utilizador não é um aluno.',
            ], 403);
        }

        $period = $request->query('period', '30d');
        $dados = $this->servico->historicoExercicio($aluno->id, $exercicio->id, $period);

        return response()->json([
            'data' => new HistoricoExercicioResource((object) $dados),
        ]);
    }
}
