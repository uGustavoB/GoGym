<?php

namespace App\Http\Controllers;

use App\Http\Requests\Exercicios\ArmazenarExercicioRequest;
use App\Http\Requests\Exercicios\AtualizarExercicioRequest;
use App\Http\Resources\ExercicioResource;
use App\Models\Exercicio;
use App\Services\ExercicioService;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class ExercicioController extends Controller
{
    public function __construct(
        private ExercicioService $servico
    ) {}

    #[OA\Get(
        path: "/exercicio",
        operationId: "listarExercicios",
        description: "Retorna uma lista paginada de exercícios visíveis pelo Personal Trainer autenticado (exercícios próprios + exercícios globais da plataforma). Requer autenticação e e-mail verificado.",
        summary: "Listar exercícios",
        security: [["sanctum" => []]],
        tags: ["Exercícios"],
        parameters: [
            new OA\Parameter(name: "page", description: "Número da página", in: "query", required: false, schema: new OA\Schema(type: "integer", default: 1)),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Lista de exercícios retornada com sucesso",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "data", type: "array", items: new OA\Items(ref: "#/components/schemas/ExercicioResource")),
                        new OA\Property(property: "links", ref: "#/components/schemas/PaginacaoLinks"),
                        new OA\Property(property: "meta", ref: "#/components/schemas/PaginacaoMeta"),
                    ]
                )
            ),
            new OA\Response(response: 401, description: "Não autenticado", content: new OA\JsonContent(ref: "#/components/schemas/ErroNaoAutenticado")),
            new OA\Response(response: 403, description: "E-mail não verificado", content: new OA\JsonContent(ref: "#/components/schemas/ErroNaoAutorizado")),
        ]
    )]
    public function index(): JsonResponse
    {
        $exercicios = $this->servico->listar();

        return response()->json(ExercicioResource::collection($exercicios)->response()->getData(true));
    }

    #[OA\Get(
        path: "/exercicio/{exercicio}",
        operationId: "exibirExercicio",
        description: "Retorna os dados detalhados de um exercício pelo seu ID. Requer autenticação e e-mail verificado.",
        summary: "Exibir um exercício específico",
        security: [["sanctum" => []]],
        tags: ["Exercícios"],
        parameters: [
            new OA\Parameter(name: "exercicio", description: "ID do exercício", in: "path", required: true, schema: new OA\Schema(type: "integer", example: 1)),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Dados do exercício retornados com sucesso",
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: "data", ref: "#/components/schemas/ExercicioResource"),
                ])
            ),
            new OA\Response(response: 401, description: "Não autenticado", content: new OA\JsonContent(ref: "#/components/schemas/ErroNaoAutenticado")),
            new OA\Response(response: 404, description: "Exercício não encontrado", content: new OA\JsonContent(ref: "#/components/schemas/ErroNaoEncontrado")),
        ]
    )]
    public function show(Exercicio $exercicio): JsonResponse
    {
        return response()->json(['data' => new ExercicioResource($exercicio)]);
    }

    #[OA\Post(
        path: "/exercicio",
        operationId: "criarExercicio",
        description: "Cria um novo exercício vinculado ao Personal Trainer autenticado. Requer autenticação e e-mail verificado.",
        summary: "Criar exercício",
        security: [["sanctum" => []]],
        requestBody: new OA\RequestBody(
            description: "Dados do exercício a ser criado",
            required: true,
            content: new OA\JsonContent(
                required: ["nome", "tipo", "grupo_muscular"],
                properties: [
                    new OA\Property(property: "nome", type: "string", example: "Supino Reto com Barra", maxLength: 255),
                    new OA\Property(property: "tipo", type: "string", enum: ["superior", "inferior", "core", "cardio", "full_body"], example: "superior"),
                    new OA\Property(property: "grupo_muscular", type: "string", enum: ["peitoral", "costas", "ombros", "biceps", "triceps", "quadriceps", "posterior_coxa", "gluteos", "panturrilhas", "abdomen", "outro"], example: "peitoral"),
                    new OA\Property(property: "video_url", type: "string", nullable: true, example: "https://www.youtube.com/watch?v=exemplo", maxLength: 2048),
                    new OA\Property(property: "instrucoes", type: "string", nullable: true, example: "Mantenha as escápulas retraídas.", maxLength: 5000),
                ]
            )
        ),
        tags: ["Exercícios"],
        responses: [
            new OA\Response(
                response: 201,
                description: "Exercício criado com sucesso",
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: "mensagem", type: "string", example: "Exercício criado com sucesso."),
                    new OA\Property(property: "data", ref: "#/components/schemas/ExercicioResource"),
                ])
            ),
            new OA\Response(response: 401, description: "Não autenticado", content: new OA\JsonContent(ref: "#/components/schemas/ErroNaoAutenticado")),
            new OA\Response(response: 403, description: "Não autorizado (não é Personal)", content: new OA\JsonContent(ref: "#/components/schemas/ErroNaoAutorizado")),
            new OA\Response(response: 422, description: "Erro de validação", content: new OA\JsonContent(ref: "#/components/schemas/ErroValidacao")),
        ]
    )]
    public function store(ArmazenarExercicioRequest $requisicao): JsonResponse
    {
        $exercicio = $this->servico->criar(
            $requisicao->validated(),
            $requisicao->user()->personal->id
        );

        return response()->json([
            'mensagem' => 'Exercício criado com sucesso.',
            'data' => new ExercicioResource($exercicio),
        ], 201);
    }

    #[OA\Put(
        path: "/exercicio/{exercicio}",
        operationId: "atualizarExercicio",
        description: "Atualiza um exercício do Personal Trainer autenticado. Não é possível editar exercícios globais. Requer autenticação e e-mail verificado.",
        summary: "Atualizar exercício",
        security: [["sanctum" => []]],
        requestBody: new OA\RequestBody(
            description: "Campos a serem atualizados (todos opcionais)",
            required: false,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: "nome", type: "string", example: "Supino Inclinado com Halter", maxLength: 255),
                    new OA\Property(property: "tipo", type: "string", enum: ["superior", "inferior", "core", "cardio", "full_body"], example: "superior"),
                    new OA\Property(property: "grupo_muscular", type: "string", enum: ["peitoral", "costas", "ombros", "biceps", "triceps", "quadriceps", "posterior_coxa", "gluteos", "panturrilhas", "abdomen", "outro"], example: "peitoral"),
                    new OA\Property(property: "video_url", type: "string", nullable: true, example: "https://www.youtube.com/watch?v=novo-video"),
                    new OA\Property(property: "instrucoes", type: "string", nullable: true, example: "Instruções atualizadas."),
                ]
            )
        ),
        tags: ["Exercícios"],
        parameters: [
            new OA\Parameter(name: "exercicio", description: "ID do exercício", in: "path", required: true, schema: new OA\Schema(type: "integer", example: 1)),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Exercício atualizado com sucesso",
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: "mensagem", type: "string", example: "Exercício atualizado com sucesso."),
                    new OA\Property(property: "data", ref: "#/components/schemas/ExercicioResource"),
                ])
            ),
            new OA\Response(response: 401, description: "Não autenticado", content: new OA\JsonContent(ref: "#/components/schemas/ErroNaoAutenticado")),
            new OA\Response(response: 403, description: "Sem permissão (exercício global ou de outro personal)", content: new OA\JsonContent(ref: "#/components/schemas/ErroNaoAutorizado")),
            new OA\Response(response: 404, description: "Exercício não encontrado", content: new OA\JsonContent(ref: "#/components/schemas/ErroNaoEncontrado")),
            new OA\Response(response: 422, description: "Erro de validação", content: new OA\JsonContent(ref: "#/components/schemas/ErroValidacao")),
        ]
    )]
    public function update(AtualizarExercicioRequest $requisicao, Exercicio $exercicio): JsonResponse
    {
        $exercicioAtualizado = $this->servico->atualizar(
            $exercicio,
            $requisicao->validated(),
            $requisicao->user()->personal->id
        );

        return response()->json([
            'mensagem' => 'Exercício atualizado com sucesso.',
            'data' => new ExercicioResource($exercicioAtualizado),
        ]);
    }

    #[OA\Delete(
        path: "/exercicio/{exercicio}",
        operationId: "excluirExercicio",
        description: "Exclui (soft delete) um exercício do Personal Trainer autenticado. Não é possível excluir exercícios globais. Requer autenticação e e-mail verificado.",
        summary: "Excluir exercício",
        security: [["sanctum" => []]],
        tags: ["Exercícios"],
        parameters: [
            new OA\Parameter(name: "exercicio", description: "ID do exercício", in: "path", required: true, schema: new OA\Schema(type: "integer", example: 1)),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Exercício excluído com sucesso",
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: "mensagem", type: "string", example: "Exercício excluído com sucesso."),
                ])
            ),
            new OA\Response(response: 401, description: "Não autenticado", content: new OA\JsonContent(ref: "#/components/schemas/ErroNaoAutenticado")),
            new OA\Response(response: 403, description: "Sem permissão", content: new OA\JsonContent(ref: "#/components/schemas/ErroNaoAutorizado")),
            new OA\Response(response: 404, description: "Exercício não encontrado", content: new OA\JsonContent(ref: "#/components/schemas/ErroNaoEncontrado")),
        ]
    )]
    public function destroy(Exercicio $exercicio): JsonResponse
    {
        $this->servico->deletar(
            $exercicio,
            auth()->user()->personal->id
        );

        return response()->json([
            'mensagem' => 'Exercício excluído com sucesso.',
        ]);
    }
}
