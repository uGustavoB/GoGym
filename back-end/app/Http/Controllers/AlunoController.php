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
    protected AlunoService $servico;

    public function __construct(AlunoService $servico)
    {
        $this->servico = $servico;
    }

    #[OA\Get(
        path: "/aluno",
        operationId: "listarAlunos",
        description: "Retorna uma lista paginada de alunos. Se o usuário autenticado for um personal, retorna apenas seus alunos vinculados. Se for um aluno, retorna apenas seus próprios dados. Requer autenticação e e-mail verificado.",
        summary: "Listar alunos",
        security: [["sanctum" => []]],
        tags: ["Alunos"],
        parameters: [
            new OA\Parameter(name: "page", description: "Número da página", in: "query", required: false, schema: new OA\Schema(type: "integer", default: 1)),
            new OA\Parameter(name: "nome", description: "Filtro parcial por nome do aluno", in: "query", required: false, schema: new OA\Schema(type: "string")),
            new OA\Parameter(name: "email", description: "Filtro parcial por e-mail do aluno", in: "query", required: false, schema: new OA\Schema(type: "string")),
            new OA\Parameter(name: "telefone", description: "Filtro parcial por telefone do aluno", in: "query", required: false, schema: new OA\Schema(type: "string")),
            new OA\Parameter(name: "status", description: "Filtro por status do vínculo (ex: ativo, inativo)", in: "query", required: false, schema: new OA\Schema(type: "string", enum: ["ativo", "inativo"])),
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
        $filtros = $requisicao->only(['nome', 'email', 'telefone', 'status']);
        $alunos = $this->servico->listar($requisicao->user(), $filtros);
        return AlunoResource::collection($alunos);
    }

    #[OA\Get(
        path: "/aluno/{aluno}",
        operationId: "exibirAluno",
        description: "Retorna os dados detalhados de um aluno pelo seu ID. O acesso é controlado por policy (apenas o próprio aluno ou o personal vinculado pode visualizar). Requer autenticação e e-mail verificado.",
        summary: "Exibir um aluno específico",
        security: [["sanctum" => []]],
        tags: ["Alunos"],
        parameters: [
            new OA\Parameter(name: "aluno", description: "ID do aluno", in: "path", required: true, schema: new OA\Schema(type: "integer", example: 1)),
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
        description: "Atualiza parcialmente os dados de um aluno. Todos os campos são opcionais. Autorização é controlada por policy. Requer autenticação e e-mail verificado.",
        summary: "Atualizar dados de um aluno",
        security: [["sanctum" => []]],
        requestBody: new OA\RequestBody(
            description: "Campos a serem atualizados",
            required: false,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: "telefone", type: "string", example: "(11) 96666-6666", maxLength: 20),
                    new OA\Property(property: "genero", type: "string", example: "feminino", nullable: true, enum: ["masculino", "feminino", "nao_binario", "outro", "prefiro_nao_informar"]),
                    new OA\Property(property: "data_nascimento", type: "string", format: "date", example: "1998-05-20", nullable: true),
                    new OA\Property(property: "peso", type: "number", format: "float", example: 70.0, nullable: true),
                    new OA\Property(property: "altura", type: "number", format: "float", example: 1.75, nullable: true),
                    new OA\Property(property: "ativo", type: "boolean", example: true),
                ]
            )
        ),
        tags: ["Alunos"],
        parameters: [
            new OA\Parameter(name: "aluno", description: "ID do aluno", in: "path", required: true, schema: new OA\Schema(type: "integer", example: 1)),
        ],
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
        description: "Marca o aluno como inativo e realiza soft delete. Requer autenticação e e-mail verificado.",
        summary: "Inativar um aluno",
        security: [["sanctum" => []]],
        tags: ["Alunos"],
        parameters: [
            new OA\Parameter(name: "aluno", description: "ID do aluno", in: "path", required: true, schema: new OA\Schema(type: "integer", example: 1)),
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
