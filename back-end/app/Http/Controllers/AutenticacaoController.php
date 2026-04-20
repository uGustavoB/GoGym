<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegistrarAlunoRequest;
use App\Http\Requests\RegistrarPersonalRequest;
use App\Services\AlunoService;
use App\Services\AuthService;
use App\Services\PersonalService;
use App\Services\UsuarioService;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class AutenticacaoController extends Controller
{
    private AuthService $authService;
    protected $personalService;
    protected $alunoService;
    protected $usuarioService;

    public function __construct(AuthService $authService, PersonalService $personalService, AlunoService $alunoService, UsuarioService $usuarioService)
    {
        $this->authService = $authService;
        $this->personalService = $personalService;
        $this->alunoService = $alunoService;
        $this->usuarioService = $usuarioService;
    }

    #[OA\Post(
        path: "/registrar/personal",
        operationId: "registrarPersonal",
        summary: "Registrar um novo Personal Trainer",
        description: "Cria um novo usuário com perfil de personal trainer. Um e-mail de verificação será enviado automaticamente via fila Redis.",
        tags: ["Autenticação"],
        requestBody: new OA\RequestBody(
            required: true,
            description: "Dados para registro do personal",
            content: new OA\JsonContent(
                required: ["nome", "email", "senha", "telefone", "genero"],
                properties: [
                    new OA\Property(property: "nome", type: "string", maxLength: 255, example: "Carlos Silva"),
                    new OA\Property(property: "email", type: "string", format: "email", maxLength: 255, example: "carlos@email.com"),
                    new OA\Property(property: "senha", type: "string", format: "password", minLength: 4, example: "senha123"),
                    new OA\Property(property: "telefone", type: "string", maxLength: 20, example: "(11) 99999-9999"),
                    new OA\Property(property: "genero", type: "string", enum: ["masculino", "feminino", "nao_binario", "outro", "prefiro_nao_informar"], example: "masculino"),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: "Personal registrado com sucesso",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "mensagem", type: "string", example: "Personal registrado com sucesso."),
                        new OA\Property(property: "dados", ref: "#/components/schemas/PersonalResource"),
                        new OA\Property(property: "token", type: "string", example: "1|abc123def456..."),
                    ]
                )
            ),
            new OA\Response(response: 422, description: "Erro de validação", content: new OA\JsonContent(ref: "#/components/schemas/ErroValidacao")),
        ]
    )]
    public function registrarPersonal(RegistrarPersonalRequest $requisicao)
    {
        $resultado = $this->personalService->registrarComUsuario($requisicao->validated());

        return response()->json([
            'mensagem' => 'Personal registrado com sucesso.',
            'dados' => $resultado['personal'],
            'token' => $resultado['token']
        ], 201);
    }

    #[OA\Post(
        path: "/registrar/aluno",
        operationId: "registrarAluno",
        summary: "Registrar um novo Aluno",
        description: "Cria um novo usuário com perfil de aluno. Opcionalmente, pode ser vinculado a um personal trainer através de um token de convite. Um e-mail de verificação será enviado automaticamente via fila Redis.",
        tags: ["Autenticação"],
        requestBody: new OA\RequestBody(
            required: true,
            description: "Dados para registro do aluno",
            content: new OA\JsonContent(
                required: ["nome", "email", "senha", "telefone"],
                properties: [
                    new OA\Property(property: "nome", type: "string", maxLength: 255, example: "João Silva"),
                    new OA\Property(property: "email", type: "string", format: "email", maxLength: 255, example: "joao@email.com"),
                    new OA\Property(property: "senha", type: "string", format: "password", minLength: 4, example: "senha123"),
                    new OA\Property(property: "telefone", type: "string", maxLength: 20, example: "(11) 98888-8888"),
                    new OA\Property(property: "genero", type: "string", enum: ["masculino", "feminino", "nao_binario", "outro", "prefiro_nao_informar"], nullable: true, example: "masculino"),
                    new OA\Property(property: "data_nascimento", type: "string", format: "date", nullable: true, example: "1998-05-20"),
                    new OA\Property(property: "peso", type: "number", format: "float", nullable: true, example: 75.5),
                    new OA\Property(property: "altura", type: "number", format: "float", nullable: true, example: 1.78),
                    new OA\Property(property: "token_convite", type: "string", nullable: true, description: "Token de convite gerado por um personal trainer", example: "aB3dEfGhIjKlMnOpQrStUvWxYz..."),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: "Aluno registrado com sucesso",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "mensagem", type: "string", example: "Aluno registrado com sucesso."),
                        new OA\Property(property: "dados", ref: "#/components/schemas/AlunoResource"),
                        new OA\Property(property: "token", type: "string", example: "2|xyz789abc012..."),
                    ]
                )
            ),
            new OA\Response(response: 422, description: "Erro de validação", content: new OA\JsonContent(ref: "#/components/schemas/ErroValidacao")),
        ]
    )]
    public function registrarAluno(RegistrarAlunoRequest $requisicao)
    {
        $resultado = $this->alunoService->registrarComUsuario($requisicao->validated());

        return response()->json([
            'mensagem' => 'Aluno registrado com sucesso.',
            'dados' => $resultado['aluno'],
            'token' => $resultado['token']
        ], 201);
    }

    #[OA\Post(
        path: "/login",
        operationId: "login",
        summary: "Autenticar usuário",
        description: "Realiza login com e-mail e senha, retornando um token de acesso Bearer (Sanctum).",
        tags: ["Autenticação"],
        requestBody: new OA\RequestBody(
            required: true,
            description: "Credenciais do usuário",
            content: new OA\JsonContent(
                required: ["email", "senha"],
                properties: [
                    new OA\Property(property: "email", type: "string", format: "email", example: "carlos@email.com"),
                    new OA\Property(property: "senha", type: "string", format: "password", example: "senha123"),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: "Login realizado com sucesso",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "usuario",
                            properties: [
                                new OA\Property(property: "id", type: "integer", example: 1),
                                new OA\Property(property: "nome", type: "string", example: "Carlos Silva"),
                                new OA\Property(property: "email", type: "string", format: "email", example: "carlos@email.com"),
                                new OA\Property(property: "data_verificacao_email", type: "string", format: "date-time", nullable: true),
                                new OA\Property(property: "created_at", type: "string", format: "date-time"),
                                new OA\Property(property: "updated_at", type: "string", format: "date-time"),
                            ],
                            type: "object"
                        ),
                        new OA\Property(property: "token", type: "string", example: "1|abc123def456..."),
                    ]
                )
            ),
            new OA\Response(
                response: 422,
                description: "Credenciais inválidas",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Os dados fornecidos são inválidos."),
                        new OA\Property(
                            property: "errors",
                            properties: [
                                new OA\Property(property: "email", type: "array", items: new OA\Items(type: "string", example: "As credenciais fornecidas estão incorretas.")),
                            ],
                            type: "object"
                        ),
                    ]
                )
            ),
        ]
    )]
    public function entrar(LoginRequest $request)
    {
        $resultado = $this->authService->login($request->validated());

        return response()->json($resultado);
    }

    #[OA\Post(
        path: "/sair",
        operationId: "logout",
        summary: "Desconectar usuário",
        description: "Revoga todos os tokens de acesso do usuário autenticado.",
        security: [["sanctum" => []]],
        tags: ["Autenticação"],
        responses: [
            new OA\Response(
                response: 200,
                description: "Desconectado com sucesso",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "mensagem", type: "string", example: "Desconectado com sucesso."),
                    ]
                )
            ),
            new OA\Response(response: 401, description: "Não autenticado", content: new OA\JsonContent(ref: "#/components/schemas/ErroNaoAutenticado")),
        ]
    )]
    public function sair(Request $request)
    {
        $this->authService->logout($request->user());

        return response()->json([
            'mensagem' => 'Desconectado com sucesso.'
        ]);
    }

    #[OA\Get(
        path: "/perfil",
        operationId: "perfil",
        summary: "Obter perfil do usuário logado",
        description: "Retorna os dados do usuário autenticado, incluindo tipo de perfil (personal/aluno) e o ID do perfil correspondente.",
        security: [["sanctum" => []]],
        tags: ["Autenticação"],
        responses: [
            new OA\Response(
                response: 200,
                description: "Dados do perfil retornados com sucesso",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: "usuario",
                            properties: [
                                new OA\Property(property: "id", type: "integer", example: 1),
                                new OA\Property(property: "nome", type: "string", example: "Carlos Silva"),
                                new OA\Property(property: "email", type: "string", format: "email", example: "carlos@email.com"),
                                new OA\Property(property: "email_verificado", type: "boolean", example: true),
                            ],
                            type: "object"
                        ),
                        new OA\Property(property: "tipo_perfil", type: "string", enum: ["personal", "aluno", "incompleto"], example: "personal"),
                        new OA\Property(property: "perfil_id", type: "integer", nullable: true, example: 1),
                    ]
                )
            ),
            new OA\Response(response: 401, description: "Não autenticado", content: new OA\JsonContent(ref: "#/components/schemas/ErroNaoAutenticado")),
        ]
    )]
    public function perfil(Request $requisicao)
    {
        return $this->usuarioService->obterUsuarioLogado($requisicao);
    }

    public function esqueciSenha(Request $request)
    {
        $dados = $request->validate([
            'email' => 'required|email'
        ]);

        $this->authService->enviarEmailRedefinicao($dados);

        return response()->json([
            'mensagem' => 'Se o e-mail estiver cadastrado, um link de redefinição foi enviado.'
        ], 200);
    }

    public function redefinirSenha(Request $request)
    {
        $dados = $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'senha' => 'required|string|min:4|confirmed'
        ]);

        $this->authService->redefinirSenha($dados);

        return response()->json([
            'mensagem' => 'Sua senha foi redefinida com sucesso.'
        ], 200);
    }
}
