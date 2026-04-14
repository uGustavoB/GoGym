<?php

namespace App\Http\Controllers;

use App\Http\Requests\Alunos\AtualizarAlunoRequest;
use App\Http\Resources\AlunoResource;
use App\Models\Aluno;
use App\Services\AlunoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use OpenApi\Attributes as OA;

class AlunoController extends Controller
{
    protected $servico;

    public function __construct(AlunoService $servico)
    {
        $this->servico = $servico;
    }

    #[OA\Get(
        path: "/aluno",
        operationId: "listarAlunos",
        summary: "Listar alunos",
        description: "Retorna uma lista paginada de alunos. Se o usuário autenticado for um personal, retorna apenas seus alunos vinculados. Se for um aluno, retorna apenas seus próprios dados. Requer autenticação e e-mail verificado.",
        security: [["sanctum" => []]],
        tags: ["Alunos"],
        parameters: [
            new OA\Parameter(name: "page", in: "query", required: false, description: "Número da página", schema: new OA\Schema(type: "integer", default: 1)),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Lista de alunos retornada com sucesso",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "data", type: "array", items: new OA\Items(ref: "#/components/schemas/AlunoResource")),
                        new OA\Property(property: "links", ref: "#/components/schemas/PaginacaoLinks"),
                        new OA\Property(property: "meta", ref: "#/components/schemas/PaginacaoMeta"),
                    ]
                )
            ),
            new OA\Response(response: 401, description: "Não autenticado", content: new OA\JsonContent(ref: "#/components/schemas/ErroNaoAutenticado")),
            new OA\Response(response: 403, description: "E-mail não verificado", content: new OA\JsonContent(ref: "#/components/schemas/ErroNaoAutorizado")),
        ]
    )]
    public function index(Request $requisicao)
    {
        $alunos = $this->servico->listar($requisicao->user());
        return AlunoResource::collection($alunos);
    }

    #[OA\Get(
        path: "/aluno/{aluno}",
        operationId: "exibirAluno",
        summary: "Exibir um aluno específico",
        description: "Retorna os dados detalhados de um aluno pelo seu ID. O acesso é controlado por policy (apenas o próprio aluno ou o personal vinculado pode visualizar). Requer autenticação e e-mail verificado.",
        security: [["sanctum" => []]],
        tags: ["Alunos"],
        parameters: [
            new OA\Parameter(name: "aluno", in: "path", required: true, description: "ID do aluno", schema: new OA\Schema(type: "integer", example: 1)),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Dados do aluno retornados com sucesso",
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: "data", ref: "#/components/schemas/AlunoResource"),
                ])
            ),
            new OA\Response(response: 401, description: "Não autenticado", content: new OA\JsonContent(ref: "#/components/schemas/ErroNaoAutenticado")),
            new OA\Response(response: 403, description: "Não autorizado", content: new OA\JsonContent(ref: "#/components/schemas/ErroNaoAutorizado")),
            new OA\Response(response: 404, description: "Aluno não encontrado", content: new OA\JsonContent(ref: "#/components/schemas/ErroNaoEncontrado")),
        ]
    )]
    public function show(Aluno $aluno)
    {
        Gate::authorize('view', $aluno);

        return new AlunoResource($aluno->load('usuario'));
    }

    #[OA\Put(
        path: "/aluno/{aluno}",
        operationId: "atualizarAluno",
        summary: "Atualizar dados de um aluno",
        description: "Atualiza parcialmente os dados de um aluno. Todos os campos são opcionais. Autorização é controlada por policy. Requer autenticação e e-mail verificado.",
        security: [["sanctum" => []]],
        tags: ["Alunos"],
        parameters: [
            new OA\Parameter(name: "aluno", in: "path", required: true, description: "ID do aluno", schema: new OA\Schema(type: "integer", example: 1)),
        ],
        requestBody: new OA\RequestBody(
            required: false,
            description: "Campos a serem atualizados",
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: "telefone", type: "string", maxLength: 20, example: "(11) 96666-6666"),
                    new OA\Property(property: "genero", type: "string", enum: ["masculino", "feminino", "nao_binario", "outro", "prefiro_nao_informar"], nullable: true, example: "feminino"),
                    new OA\Property(property: "data_nascimento", type: "string", format: "date", nullable: true, example: "1998-05-20"),
                    new OA\Property(property: "peso", type: "number", format: "float", nullable: true, example: 70.0),
                    new OA\Property(property: "altura", type: "number", format: "float", nullable: true, example: 1.75),
                    new OA\Property(property: "ativo", type: "boolean", example: true),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: "Aluno atualizado com sucesso",
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: "data", ref: "#/components/schemas/AlunoResource"),
                ])
            ),
            new OA\Response(response: 401, description: "Não autenticado", content: new OA\JsonContent(ref: "#/components/schemas/ErroNaoAutenticado")),
            new OA\Response(response: 403, description: "Não autorizado", content: new OA\JsonContent(ref: "#/components/schemas/ErroNaoAutorizado")),
            new OA\Response(response: 404, description: "Aluno não encontrado", content: new OA\JsonContent(ref: "#/components/schemas/ErroNaoEncontrado")),
            new OA\Response(response: 422, description: "Erro de validação", content: new OA\JsonContent(ref: "#/components/schemas/ErroValidacao")),
        ]
    )]
    public function update(AtualizarAlunoRequest $requisicao, Aluno $aluno)
    {
        $alunoAtualizado = $this->servico->atualizar($aluno, $requisicao->validated());
        return new AlunoResource($alunoAtualizado);
    }

    #[OA\Delete(
        path: "/aluno/{aluno}",
        operationId: "deletarAluno",
        summary: "Inativar um aluno",
        description: "Marca o aluno como inativo e realiza soft delete. Requer autenticação e e-mail verificado.",
        security: [["sanctum" => []]],
        tags: ["Alunos"],
        parameters: [
            new OA\Parameter(name: "aluno", in: "path", required: true, description: "ID do aluno", schema: new OA\Schema(type: "integer", example: 1)),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Aluno inativado com sucesso",
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: "mensagem", type: "string", example: "Aluno inativado com sucesso."),
                ])
            ),
            new OA\Response(response: 401, description: "Não autenticado", content: new OA\JsonContent(ref: "#/components/schemas/ErroNaoAutenticado")),
            new OA\Response(response: 404, description: "Aluno não encontrado", content: new OA\JsonContent(ref: "#/components/schemas/ErroNaoEncontrado")),
        ]
    )]
    public function destroy(Aluno $aluno)
    {
        $this->servico->deletar($aluno);
        return response()->json(['mensagem' => 'Aluno inativado com sucesso.']);
    }
}
