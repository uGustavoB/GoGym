<?php

namespace App\Http\Controllers;

use App\Http\Requests\Personais\ArmazenarPersonalRequest;
use App\Http\Requests\Personais\AtualizarPersonalRequest;
use App\Http\Requests\Personais\GerarConviteRequest;
use App\Http\Resources\PersonalResource;
use App\Models\Personal;
use App\Services\ConviteService;
use App\Services\PersonalService;
use OpenApi\Attributes as OA;

class PersonalController extends Controller
{
    protected PersonalService $servico;

    public function __construct(PersonalService $servico)
    {
        $this->servico = $servico;
    }

    #[OA\Get(
        path: "/personal",
        operationId: "listarPersonais",
        description: "Retorna uma lista paginada de todos os personal trainers cadastrados. Requer autenticação e e-mail verificado.",
        summary: "Listar todos os personais",
        security: [["sanctum" => []]],
        tags: ["Personais"],
        parameters: [
            new OA\Parameter(name: "page", description: "Número da página", in: "query", required: false, schema: new OA\Schema(type: "integer", default: 1)),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Lista de personais retornada com sucesso",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "data", type: "array", items: new OA\Items(ref: "#/components/schemas/PersonalResource")),
                        new OA\Property(property: "links", ref: "#/components/schemas/PaginacaoLinks"),
                        new OA\Property(property: "meta", ref: "#/components/schemas/PaginacaoMeta"),
                    ]
                )
            ),
            new OA\Response(response: 401, description: "Não autenticado", content: new OA\JsonContent(ref: "#/components/schemas/ErroNaoAutenticado")),
            new OA\Response(response: 403, description: "E-mail não verificado", content: new OA\JsonContent(ref: "#/components/schemas/ErroNaoAutorizado")),
        ]
    )]
    public function index()
    {
        $personais = $this->servico->listar();
        return PersonalResource::collection($personais);
    }

    #[OA\Get(
        path: "/personal/{personal}",
        operationId: "exibirPersonal",
        description: "Retorna os dados detalhados de um personal trainer pelo seu ID. Requer autenticação e e-mail verificado.",
        summary: "Exibir um personal específico",
        security: [["sanctum" => []]],
        tags: ["Personais"],
        parameters: [
            new OA\Parameter(name: "personal", description: "ID do personal", in: "path", required: true, schema: new OA\Schema(type: "integer", example: 1)),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Dados do personal retornados com sucesso",
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: "data", ref: "#/components/schemas/PersonalResource"),
                ])
            ),
            new OA\Response(response: 401, description: "Não autenticado", content: new OA\JsonContent(ref: "#/components/schemas/ErroNaoAutenticado")),
            new OA\Response(response: 404, description: "Personal não encontrado", content: new OA\JsonContent(ref: "#/components/schemas/ErroNaoEncontrado")),
        ]
    )]
    public function show(Personal $personal)
    {
        return new PersonalResource($personal->load('usuario'));
    }

    #[OA\Put(
        path: "/personal/{personal}",
        operationId: "atualizarPersonal",
        description: "Atualiza parcialmente os dados de um personal trainer. Todos os campos são opcionais. Requer autenticação e e-mail verificado.",
        summary: "Atualizar dados de um personal",
        security: [["sanctum" => []]],
        requestBody: new OA\RequestBody(
            description: "Campos a serem atualizados",
            required: false,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: "telefone", type: "string", example: "(11) 97777-7777", maxLength: 20),
                    new OA\Property(property: "genero", type: "string", example: "feminino", enum: ["masculino", "feminino", "nao_binario", "outro", "prefiro_nao_informar"]),
                ]
            )
        ),
        tags: ["Personais"],
        parameters: [
            new OA\Parameter(name: "personal", description: "ID do personal", in: "path", required: true, schema: new OA\Schema(type: "integer", example: 1)),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Personal atualizado com sucesso",
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: "data", ref: "#/components/schemas/PersonalResource"),
                ])
            ),
            new OA\Response(response: 401, description: "Não autenticado", content: new OA\JsonContent(ref: "#/components/schemas/ErroNaoAutenticado")),
            new OA\Response(response: 404, description: "Personal não encontrado", content: new OA\JsonContent(ref: "#/components/schemas/ErroNaoEncontrado")),
            new OA\Response(response: 422, description: "Erro de validação", content: new OA\JsonContent(ref: "#/components/schemas/ErroValidacao")),
        ]
    )]
    public function update(AtualizarPersonalRequest $requisicao, Personal $personal)
    {
        $personalAtualizado = $this->servico->atualizar($personal, $requisicao->validated());
        return new PersonalResource($personalAtualizado);
    }

    #[OA\Delete(
        path: "/personal/{personal}",
        operationId: "deletarPersonal",
        description: "Realiza soft delete de um personal trainer. Requer autenticação e e-mail verificado.",
        summary: "Inativar um personal",
        security: [["sanctum" => []]],
        tags: ["Personais"],
        parameters: [
            new OA\Parameter(name: "personal", description: "ID do personal", in: "path", required: true, schema: new OA\Schema(type: "integer", example: 1)),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Personal inativado com sucesso",
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: "mensagem", type: "string", example: "Personal inativado com sucesso."),
                ])
            ),
            new OA\Response(response: 401, description: "Não autenticado", content: new OA\JsonContent(ref: "#/components/schemas/ErroNaoAutenticado")),
            new OA\Response(response: 404, description: "Personal não encontrado", content: new OA\JsonContent(ref: "#/components/schemas/ErroNaoEncontrado")),
        ]
    )]
    public function destroy(Personal $personal)
    {
        $this->servico->deletar($personal);
        return response()->json(['mensagem' => 'Personal inativado com sucesso.']);
    }

    #[OA\Post(
        path: "/personal/gerar-convite",
        operationId: "gerarConvite",
        description: "Gera um token de convite para vincular um aluno ao personal trainer autenticado. O aluno utilizará esse token no momento do registro. Se já existir um convite pendente para o mesmo e-mail, o existente será retornado. Requer autenticação e e-mail verificado.",
        summary: "Gerar convite para aluno",
        security: [["sanctum" => []]],
        requestBody: new OA\RequestBody(
            description: "Dados do convite",
            required: true,
            content: new OA\JsonContent(
                required: ["nome", "email"],
                properties: [
                    new OA\Property(property: "nome", type: "string", example: "João Silva", maxLength: 255),
                    new OA\Property(property: "email", type: "string", format: "email", example: "joao@email.com", maxLength: 255),
                ]
            )
        ),
        tags: ["Convites"],
        responses: [
            new OA\Response(
                response: 200,
                description: "Convite gerado com sucesso",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "mensagem", type: "string", example: "Convite gerado com sucesso."),
                        new OA\Property(
                            property: "convite",
                            properties: [
                                new OA\Property(property: "email", type: "string", format: "email", example: "joao@email.com"),
                                new OA\Property(property: "token", type: "string", example: "aB3dEfGhIjKlMnOpQrStUvWxYz1234567890abcdefghijklmnopqrstuv"),
                                new OA\Property(property: "status", type: "string", example: "pendente", enum: ["pendente", "aceito"]),
                            ],
                            type: "object"
                        ),
                    ]
                )
            ),
            new OA\Response(response: 401, description: "Não autenticado", content: new OA\JsonContent(ref: "#/components/schemas/ErroNaoAutenticado")),
            new OA\Response(response: 422, description: "Erro de validação", content: new OA\JsonContent(ref: "#/components/schemas/ErroValidacao")),
        ]
    )]
    public function gerarConvite(GerarConviteRequest $requisicao)
    {
        $dados = $requisicao->validated();

        $personalId = $this->servico
            ->buscarPorUsuarioId($requisicao->user()->id)
            ->first()
            ->id;

        $dados['personal_id'] = $personalId;

        $convite = app(ConviteService::class)
            ->gerarConvite($dados);

        return response()->json([
            'mensagem' => 'Convite gerado com sucesso.',
            'convite' => [
                'email' => $convite->email,
                'token' => $convite->token,
                'status' => $convite->status,
            ]
        ]);
    }
}
