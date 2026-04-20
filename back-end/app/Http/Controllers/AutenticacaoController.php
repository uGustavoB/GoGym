<?php

namespace App\Http\Controllers;

use App\Http\Requests\EsqueciSenhaRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RedefinirSenhaRequest;
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
    protected PersonalService $personalService;
    protected AlunoService $alunoService;
    protected UsuarioService $usuarioService;

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
        description: "Cria um novo usuário com perfil de personal trainer. Um e-mail de verificação será enviado automaticamente via fila Redis.",
        summary: "Registrar um novo Personal Trainer",
        requestBody: new OA\RequestBody(
            description: "Dados para registro do personal",
            required: true,
            content: new OA\JsonContent(
                required: ["nome", "email", "senha", "telefone", "genero"],
                properties: [
                    new OA\Property(property: "nome", type: "string", example: "Carlos Silva", maxLength: 255),
                    new OA\Property(property: "email", type: "string", format: "email", example: "carlos@email.com", maxLength: 255),
                    new OA\Property(property: "senha", type: "string", format: "password", example: "senha123", minLength: 4),
                    new OA\Property(property: "telefone", type: "string", example: "(11) 99999-9999", maxLength: 20),
                    new OA\Property(property: "genero", type: "string", example: "masculino", enum: ["masculino", "feminino", "nao_binario", "outro", "prefiro_nao_informar"]),
                ]
            )
        ),
        tags: ["Autenticação"],
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
        description: "Cria um novo usuário com perfil de aluno. Opcionalmente, pode ser vinculado a um personal trainer através de um token de convite. Um e-mail de verificação será enviado automaticamente via fila Redis.",
        summary: "Registrar um novo Aluno",
        requestBody: new OA\RequestBody(
            description: "Dados para registro do aluno",
            required: true,
            content: new OA\JsonContent(
                required: ["nome", "email", "senha", "telefone"],
                properties: [
                    new OA\Property(property: "nome", type: "string", example: "João Silva", maxLength: 255),
                    new OA\Property(property: "email", type: "string", format: "email", example: "joao@email.com", maxLength: 255),
                    new OA\Property(property: "senha", type: "string", format: "password", example: "senha123", minLength: 4),
                    new OA\Property(property: "telefone", type: "string", example: "(11) 98888-8888", maxLength: 20),
                    new OA\Property(property: "genero", type: "string", example: "masculino", nullable: true, enum: ["masculino", "feminino", "nao_binario", "outro", "prefiro_nao_informar"]),
                    new OA\Property(property: "data_nascimento", type: "string", format: "date", example: "1998-05-20", nullable: true),
                    new OA\Property(property: "peso", type: "number", format: "float", example: 75.5, nullable: true),
                    new OA\Property(property: "altura", type: "number", format: "float", example: 1.78, nullable: true),
                    new OA\Property(property: "token_convite", description: "Token de convite gerado por um personal trainer", type: "string", example: "aB3dEfGhIjKlMnOpQrStUvWxYz...", nullable: true),
                ]
            )
        ),
        tags: ["Autenticação"],
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
        description: "Realiza login com e-mail e senha, retornando um token de acesso Bearer (Sanctum).",
        summary: "Autenticar usuário",
        requestBody: new OA\RequestBody(
            description: "Credenciais do usuário",
            required: true,
            content: new OA\JsonContent(
                required: ["email", "senha"],
                properties: [
                    new OA\Property(property: "email", type: "string", format: "email", example: "carlos@email.com"),
                    new OA\Property(property: "senha", type: "string", format: "password", example: "senha123"),
                ]
            )
        ),
        tags: ["Autenticação"],
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
        description: "Revoga todos os tokens de acesso do usuário autenticado.",
        summary: "Desconectar usuário",
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
        description: "Retorna os dados do usuário autenticado, incluindo tipo de perfil (personal/aluno) e o ID do perfil correspondente.",
        summary: "Obter perfil do usuário logado",
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
                        new OA\Property(property: "tipo_perfil", type: "string", example: "personal", enum: ["personal", "aluno", "incompleto"]),
                        new OA\Property(property: "perfil_id", type: "integer", example: 1, nullable: true),
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

    #[OA\Post(
        path: "/esqueci-senha",
        operationId: "esqueciSenha",
        description: "Envia um link de redefinição de senha para o e-mail informado (se o usuário existir).",
        summary: "Solicitar redefinição de senha",
        requestBody: new OA\RequestBody(
            description: "E-mail do usuário para recuperação",
            required: true,
            content: new OA\JsonContent(
                required: ["email"],
                properties: [
                    new OA\Property(property: "email", type: "string", format: "email", example: "carlos@email.com")
                ]
            )
        ),
        tags: ["Autenticação"],
        responses: [
            new OA\Response(
                response: 200,
                description: "Solicitação processada com sucesso",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "mensagem", type: "string", example: "Se o e-mail estiver cadastrado, um link de redefinição foi enviado.")
                    ]
                )
            ),
            new OA\Response(
                response: 422,
                description: "Erro de validação",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Os dados fornecidos são inválidos."),
                        new OA\Property(
                            property: "errors",
                            properties: [
                                new OA\Property(
                                    property: "email",
                                    type: "array",
                                    items: new OA\Items(type: "string", example: "O endereço de e-mail é obrigatório.")
                                )
                            ],
                            type: "object"
                        )
                    ]
                )
            )
        ]
    )]
    public function esqueciSenha(EsqueciSenhaRequest $request)
    {
        $dados = $request->validated();

        $this->authService->enviarEmailRedefinicao($dados);

        return response()->json([
            'mensagem' => 'Se o e-mail estiver cadastrado, um link de redefinição foi enviado.'
        ]);
    }

    #[OA\Post(
        path: "/redefinir-senha",
        operationId: "redefinirSenha",
        description: "Redefine a senha do usuário utilizando o token enviado por e-mail. Este método invalida todos os tokens de acesso ativos para o usuário logar novamente.",
        summary: "Redefinir senha do usuário",
        requestBody: new OA\RequestBody(
            description: "Dados para redefinição de senha",
            required: true,
            content: new OA\JsonContent(
                required: ["email", "token", "senha", "senha_confirmation"],
                properties: [
                    new OA\Property(property: "email", type: "string", format: "email", example: "carlos@email.com"),
                    new OA\Property(property: "token", type: "string", example: "abc123def456..."),
                    new OA\Property(property: "senha", type: "string", format: "password", example: "nova-senha-123", minLength: 4),
                    new OA\Property(property: "senha_confirmation", type: "string", format: "password", example: "nova-senha-123", minLength: 4)
                ]
            )
        ),
        tags: ["Autenticação"],
        responses: [
            new OA\Response(
                response: 200,
                description: "Senha redefinida com sucesso",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "mensagem", type: "string", example: "Sua senha foi redefinida com sucesso.")
                    ]
                )
            ),
            new OA\Response(
                response: 422,
                description: "Erro de validação",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "message", type: "string", example: "Os dados fornecidos são inválidos."),
                        new OA\Property(
                            property: "errors",
                            properties: [
                                new OA\Property(
                                    property: "email",
                                    type: "array",
                                    items: new OA\Items(type: "string", example: "O formato do e-mail fornecido é inválido.")
                                ),
                                new OA\Property(
                                    property: "token",
                                    type: "array",
                                    items: new OA\Items(type: "string", example: "O token de validação é obrigatório na requisição.")
                                ),
                                new OA\Property(
                                    property: "senha",
                                    type: "array",
                                    items: new OA\Items(type: "string", example: "A confirmação de senha não confere.")
                                )
                            ],
                            type: "object"
                        )
                    ]
                )
            )
        ]
    )]
    public function redefinirSenha(RedefinirSenhaRequest $request)
    {
        $dados = $request->validated();

        $this->authService->redefinirSenha($dados);

        return response()->json([
            'mensagem' => 'Sua senha foi redefinida com sucesso.'
        ]);
    }
}
