<?php

namespace App\Http\Controllers;

use App\Http\Requests\Treinos\ArmazenarFichaTreinoRequest;
use App\Http\Resources\FichaTreinoResource;
use App\Models\FichaTreino;
use App\Services\FichaTreinoService;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class FichaTreinoController extends Controller
{
    public function __construct(
        private FichaTreinoService $servico
    ) {}

    #[OA\Get(
        path: "/ficha-treino",
        operationId: "listarFichasTreino",
        description: "Retorna uma lista paginada das fichas de treino criadas pelo Personal Trainer autenticado, incluindo os dados do aluno vinculado. Requer autenticação e e-mail verificado.",
        summary: "Listar fichas de treino",
        security: [["sanctum" => []]],
        tags: ["Treinos"],
        parameters: [
            new OA\Parameter(name: "page", description: "Número da página", in: "query", required: false, schema: new OA\Schema(type: "integer", default: 1)),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Lista de fichas de treino retornada com sucesso",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "data", type: "array", items: new OA\Items(ref: "#/components/schemas/FichaTreinoResource")),
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
        $fichas = $this->servico->listar();

        return response()->json(FichaTreinoResource::collection($fichas)->response()->getData(true));
    }

    #[OA\Get(
        path: "/ficha-treino/{ficha_treino}",
        operationId: "exibirFichaTreino",
        description: "Retorna os dados completos de uma ficha de treino, incluindo aluno, semanas de periodização, rotinas (sessões A, B, C...) e os exercícios de cada rotina com seus parâmetros. Requer autenticação e e-mail verificado.",
        summary: "Exibir ficha de treino completa",
        security: [["sanctum" => []]],
        tags: ["Treinos"],
        parameters: [
            new OA\Parameter(name: "ficha_treino", description: "ID da ficha de treino", in: "path", required: true, schema: new OA\Schema(type: "integer", example: 1)),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Dados da ficha de treino retornados com sucesso",
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: "data", ref: "#/components/schemas/FichaTreinoResource"),
                ])
            ),
            new OA\Response(response: 401, description: "Não autenticado", content: new OA\JsonContent(ref: "#/components/schemas/ErroNaoAutenticado")),
            new OA\Response(response: 404, description: "Ficha de treino não encontrada", content: new OA\JsonContent(ref: "#/components/schemas/ErroNaoEncontrado")),
        ]
    )]
    public function show(FichaTreino $fichaTreino): JsonResponse
    {
        $ficha = $this->servico->buscarComRelacionamentos($fichaTreino);

        return response()->json(['data' => new FichaTreinoResource($ficha)]);
    }

    #[OA\Post(
        path: "/ficha-treino",
        operationId: "criarFichaTreino",
        description: "Cria uma ficha de treino completa de forma atômica (transacional). O payload inclui a ficha principal, um array de semanas (periodização) e um array de rotinas, cada uma contendo seus exercícios com parâmetros detalhados. O aluno informado deve estar vinculado (status ativo) ao Personal autenticado. Requer autenticação e e-mail verificado.",
        summary: "Criar ficha de treino completa",
        security: [["sanctum" => []]],
        requestBody: new OA\RequestBody(
            description: "Payload completo da ficha de treino com semanas, rotinas e exercícios",
            required: true,
            content: new OA\JsonContent(ref: "#/components/schemas/ArmazenarFichaTreinoBody")
        ),
        tags: ["Treinos"],
        responses: [
            new OA\Response(
                response: 201,
                description: "Ficha de treino criada com sucesso",
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: "mensagem", type: "string", example: "Ficha de treino criada com sucesso."),
                    new OA\Property(property: "data", ref: "#/components/schemas/FichaTreinoResource"),
                ])
            ),
            new OA\Response(response: 401, description: "Não autenticado", content: new OA\JsonContent(ref: "#/components/schemas/ErroNaoAutenticado")),
            new OA\Response(response: 403, description: "Não autorizado (não é Personal)", content: new OA\JsonContent(ref: "#/components/schemas/ErroNaoAutorizado")),
            new OA\Response(response: 422, description: "Erro de validação", content: new OA\JsonContent(ref: "#/components/schemas/ErroValidacao")),
            new OA\Response(
                response: 500,
                description: "Erro interno ao salvar",
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: "mensagem", type: "string", example: "Erro interno ao salvar a ficha de treino. Tente novamente."),
                ])
            ),
        ]
    )]
    public function store(ArmazenarFichaTreinoRequest $requisicao): JsonResponse
    {
        try {
            $fichaTreino = $this->servico->criar(
                $requisicao->validated(),
                $requisicao->user()->personal->id
            );

            return response()->json([
                'mensagem' => 'Ficha de treino criada com sucesso.',
                'data' => new FichaTreinoResource($fichaTreino),
            ], 201);
        } catch (\Throwable) {
            return response()->json([
                'mensagem' => 'Erro interno ao salvar a ficha de treino. Tente novamente.',
            ], 500);
        }
    }

    #[OA\Delete(
        path: "/ficha-treino/{ficha_treino}",
        operationId: "excluirFichaTreino",
        description: "Exclui (soft delete) uma ficha de treino. Requer autenticação e e-mail verificado.",
        summary: "Excluir ficha de treino",
        security: [["sanctum" => []]],
        tags: ["Treinos"],
        parameters: [
            new OA\Parameter(name: "ficha_treino", description: "ID da ficha de treino", in: "path", required: true, schema: new OA\Schema(type: "integer", example: 1)),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Ficha de treino excluída com sucesso",
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: "mensagem", type: "string", example: "Ficha de treino excluída com sucesso."),
                ])
            ),
            new OA\Response(response: 401, description: "Não autenticado", content: new OA\JsonContent(ref: "#/components/schemas/ErroNaoAutenticado")),
            new OA\Response(response: 404, description: "Ficha de treino não encontrada", content: new OA\JsonContent(ref: "#/components/schemas/ErroNaoEncontrado")),
        ]
    )]
    public function destroy(FichaTreino $fichaTreino): JsonResponse
    {
        $this->servico->deletar($fichaTreino);

        return response()->json([
            'mensagem' => 'Ficha de treino excluída com sucesso.',
        ]);
    }
}
