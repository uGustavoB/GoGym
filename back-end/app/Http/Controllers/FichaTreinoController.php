<?php

namespace App\Http\Controllers;

use App\Http\Requests\Treinos\ArmazenarFichaTreinoRequest;
use App\Http\Requests\Treinos\AtualizarFichaTreinoRequest;
use App\Http\Resources\FichaTreinoResource;
use App\Models\FichaTreino;
use App\Services\FichaTreinoService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use OpenApi\Attributes as OA;

class FichaTreinoController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private FichaTreinoService $servico
    ) {}

    #[OA\Get(
        path: "/ficha-treino",
        operationId: "listarFichasTreino",
        description: "Retorna uma lista paginada das fichas de treino. Para Personal: somente as fichas que ele criou. Para Aluno: todas as fichas vinculadas a ele (inclusive as criadas por um personal). Requer autenticação e e-mail verificado.",
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
            new OA\Response(response: 403, description: "Sem perfil de personal ou aluno", content: new OA\JsonContent(ref: "#/components/schemas/ErroNaoAutorizado")),
        ]
    )]
    public function index(): JsonResponse
    {
        $usuario = Auth::user();
        $this->authorize('viewAny', FichaTreino::class);

        $fichas = $this->servico->listar($usuario);

        return response()->json(FichaTreinoResource::collection($fichas)->response()->getData(true));
    }

    #[OA\Get(
        path: "/ficha-treino/{ficha_treino}",
        operationId: "exibirFichaTreino",
        description: "Retorna os dados completos de uma ficha de treino. Personal acessa somente fichas que criou; Aluno acessa fichas vinculadas ao seu aluno_id.",
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
            new OA\Response(response: 403, description: "Não autorizado a ver esta ficha", content: new OA\JsonContent(ref: "#/components/schemas/ErroNaoAutorizado")),
            new OA\Response(response: 404, description: "Ficha de treino não encontrada", content: new OA\JsonContent(ref: "#/components/schemas/ErroNaoEncontrado")),
        ]
    )]
    public function show(FichaTreino $fichaTreino): JsonResponse
    {
        $this->authorize('view', $fichaTreino);

        $ficha = $this->servico->buscarComRelacionamentos($fichaTreino);

        return response()->json(['data' => new FichaTreinoResource($ficha)]);
    }

    #[OA\Post(
        path: "/ficha-treino",
        operationId: "criarFichaTreino",
        description: "Cria uma ficha de treino completa. Personal deve informar aluno_id (vinculado e ativo). Aluno cria para si mesmo sem informar aluno_id. Requer autenticação e e-mail verificado.",
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
            new OA\Response(response: 403, description: "Sem perfil de personal ou aluno", content: new OA\JsonContent(ref: "#/components/schemas/ErroNaoAutorizado")),
            new OA\Response(response: 422, description: "Erro de validação", content: new OA\JsonContent(ref: "#/components/schemas/ErroValidacao")),
            new OA\Response(response: 500, description: "Erro interno ao salvar", content: new OA\JsonContent(properties: [
                new OA\Property(property: "mensagem", type: "string", example: "Erro interno ao salvar a ficha de treino. Tente novamente."),
            ])),
        ]
    )]
    public function store(ArmazenarFichaTreinoRequest $requisicao): JsonResponse
    {
        try {
            $fichaTreino = $this->servico->criar(
                $requisicao->validated(),
                $requisicao->user()
            );

            return response()->json([
                'mensagem' => 'Ficha de treino criada com sucesso.',
                'data'     => new FichaTreinoResource($fichaTreino),
            ], 201);
        } catch (\Throwable $e) {
            report($e);
            return response()->json([
                'mensagem' => 'Erro interno ao salvar a ficha de treino. Tente novamente.',
            ], 500);
        }
    }

    #[OA\Put(
        path: "/ficha-treino/{ficha_treino}",
        operationId: "atualizarFichaTreino",
        description: "Atualiza uma ficha de treino. Personal só atualiza fichas que criou; Aluno só atualiza fichas que ele mesmo criou (personal_id nulo). Usa upsert inteligente para preservar IDs referenciados pelo histórico.",
        summary: "Atualizar ficha de treino",
        security: [["sanctum" => []]],
        requestBody: new OA\RequestBody(
            description: "Payload completo da ficha de treino",
            required: true,
            content: new OA\JsonContent(ref: "#/components/schemas/ArmazenarFichaTreinoBody")
        ),
        tags: ["Treinos"],
        parameters: [
            new OA\Parameter(name: "ficha_treino", description: "ID da ficha de treino", in: "path", required: true, schema: new OA\Schema(type: "integer", example: 1)),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Ficha de treino atualizada com sucesso",
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: "mensagem", type: "string", example: "Ficha de treino atualizada com sucesso."),
                    new OA\Property(property: "data", ref: "#/components/schemas/FichaTreinoResource"),
                ])
            ),
            new OA\Response(response: 401, description: "Não autenticado", content: new OA\JsonContent(ref: "#/components/schemas/ErroNaoAutenticado")),
            new OA\Response(response: 403, description: "Não é o criador desta ficha", content: new OA\JsonContent(ref: "#/components/schemas/ErroNaoAutorizado")),
            new OA\Response(response: 404, description: "Ficha de treino não encontrada", content: new OA\JsonContent(ref: "#/components/schemas/ErroNaoEncontrado")),
            new OA\Response(response: 422, description: "Erro de validação", content: new OA\JsonContent(ref: "#/components/schemas/ErroValidacao")),
            new OA\Response(response: 500, description: "Erro interno ao atualizar", content: new OA\JsonContent(properties: [
                new OA\Property(property: "mensagem", type: "string", example: "Erro interno ao atualizar a ficha de treino. Tente novamente."),
            ])),
        ]
    )]
    public function update(AtualizarFichaTreinoRequest $requisicao, FichaTreino $fichaTreino): JsonResponse
    {
        $this->authorize('update', $fichaTreino);

        try {
            $fichaTreinoAtualizada = $this->servico->atualizar(
                $fichaTreino,
                $requisicao->validated(),
                $requisicao->user()
            );

            return response()->json([
                'mensagem' => 'Ficha de treino atualizada com sucesso.',
                'data'     => new FichaTreinoResource($fichaTreinoAtualizada),
            ]);
        } catch (\Throwable $e) {
            report($e);
            return response()->json([
                'mensagem' => 'Erro interno ao atualizar a ficha de treino. Tente novamente.',
            ], 500);
        }
    }

    #[OA\Delete(
        path: "/ficha-treino/{ficha_treino}",
        operationId: "excluirFichaTreino",
        description: "Exclui (soft delete) uma ficha de treino. Somente o criador pode excluir.",
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
            new OA\Response(response: 403, description: "Não é o criador desta ficha", content: new OA\JsonContent(ref: "#/components/schemas/ErroNaoAutorizado")),
            new OA\Response(response: 404, description: "Ficha de treino não encontrada", content: new OA\JsonContent(ref: "#/components/schemas/ErroNaoEncontrado")),
        ]
    )]
    public function destroy(FichaTreino $fichaTreino): JsonResponse
    {
        $this->authorize('delete', $fichaTreino);

        $this->servico->deletar($fichaTreino);

        return response()->json([
            'mensagem' => 'Ficha de treino excluída com sucesso.',
        ]);
    }
}
