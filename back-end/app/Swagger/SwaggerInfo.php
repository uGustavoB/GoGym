<?php

namespace App\Swagger;

use OpenApi\Attributes as OA;

#[OA\Info(
    title: "GoGym API",
    version: "1.0.0",
    description: "API REST para gerenciamento de academias, personal trainers e alunos. Permite registro de usuários (personal e aluno), autenticação via token (Sanctum), verificação de e-mail, CRUD completo de personais e alunos, e sistema de convites para vinculação entre personal e aluno.",
    contact: new OA\Contact(
        name: "Gustavo",
        email: "nao-responda@ugustavodev.com.br"
    ),
    license: new OA\License(
        name: "Proprietária",
        url: "https://ugustavodev.com.br"
    )
)]
#[OA\Server(
    url: "http://localhost:84/api",
    description: "Servidor de Desenvolvimento"
)]
#[OA\SecurityScheme(
    securityScheme: "sanctum",
    type: "http",
    scheme: "bearer",
    bearerFormat: "Sanctum",
    description: "Insira o token retornado no login/registro."
)]
#[OA\Tag(name: "Autenticação", description: "Rotas de registro, login, logout e perfil do usuário")]
#[OA\Tag(name: "Verificação de E-mail", description: "Rotas para verificação e reenvio de e-mail de confirmação")]
#[OA\Tag(name: "Personais", description: "CRUD de Personal Trainers (requer e-mail verificado)")]
#[OA\Tag(name: "Alunos", description: "CRUD de Alunos (requer e-mail verificado)")]
#[OA\Tag(name: "Convites", description: "Sistema de convites para vincular alunos a personais")]
#[OA\Tag(name: "Exercícios", description: "CRUD de Exercícios do Personal Trainer (requer e-mail verificado)")]
#[OA\Tag(name: "Treinos", description: "Gestão de Fichas de Treino, semanas e rotinas (requer e-mail verificado)")]
#[OA\Tag(name: "App Aluno - Execução", description: "Visualização do treino atual e registo de sessões de treino pelo aluno (requer e-mail verificado)")]

// --- Schemas reutilizáveis ---

#[OA\Schema(
    schema: "ErroValidacao",
    properties: [
        new OA\Property(property: "message", type: "string", example: "Os dados fornecidos são inválidos."),
        new OA\Property(
            property: "errors",
            type: "object",
            additionalProperties: new OA\AdditionalProperties(
                type: "array",
                items: new OA\Items(type: "string")
            )
        ),
    ]
)]
#[OA\Schema(
    schema: "ErroNaoAutenticado",
    properties: [
        new OA\Property(property: "message", type: "string", example: "Unauthenticated."),
    ]
)]
#[OA\Schema(
    schema: "ErroNaoAutorizado",
    properties: [
        new OA\Property(property: "message", type: "string", example: "This action is unauthorized."),
    ]
)]
#[OA\Schema(
    schema: "ErroNaoEncontrado",
    properties: [
        new OA\Property(property: "message", type: "string", example: "Recurso não encontrado."),
    ]
)]
#[OA\Schema(
    schema: "MensagemSucesso",
    properties: [
        new OA\Property(property: "mensagem", type: "string"),
    ]
)]
#[OA\Schema(
    schema: "PersonalResource",
    properties: [
        new OA\Property(property: "id", type: "integer", example: 1),
        new OA\Property(property: "usuario_id", type: "integer", example: 1),
        new OA\Property(property: "telefone", type: "string", example: "(11) 99999-9999"),
        new OA\Property(property: "genero", type: "string", enum: ["masculino", "feminino", "nao_binario", "outro", "prefiro_nao_informar"], example: "masculino"),
        new OA\Property(property: "cadastrado_em", type: "string", format: "date-time", example: "2026-04-13 22:00:00"),
        new OA\Property(property: "atualizado_em", type: "string", format: "date-time", example: "2026-04-13 22:00:00"),
        new OA\Property(property: "deletado_em", type: "string", format: "date-time", nullable: true, example: null),
    ]
)]
#[OA\Schema(
    schema: "AlunoResource",
    properties: [
        new OA\Property(property: "id", type: "integer", example: 1),
        new OA\Property(property: "nome", type: "string", example: "João Silva"),
        new OA\Property(property: "email", type: "string", format: "email", example: "joao@email.com"),
        new OA\Property(property: "telefone", type: "string", example: "(11) 99999-9999"),
        new OA\Property(property: "genero", type: "string", enum: ["masculino", "feminino", "nao_binario", "outro", "prefiro_nao_informar"], nullable: true, example: "masculino"),
        new OA\Property(
            property: "dados_fisicos",
            properties: [
                new OA\Property(property: "peso", type: "number", format: "float", nullable: true, example: 75.5),
                new OA\Property(property: "altura", type: "number", format: "float", nullable: true, example: 1.78),
                new OA\Property(property: "data_nascimento", type: "string", format: "date", nullable: true, example: "1998-05-20"),
            ],
            type: "object"
        ),
        new OA\Property(property: "status_vinculo", type: "string", nullable: true, example: "ativo"),
        new OA\Property(property: "status_conta", type: "string", enum: ["Ativo", "Inativo"], example: "Ativo"),
        new OA\Property(property: "cadastrado_em", type: "string", format: "date-time", example: "2026-04-13 22:00:00"),
    ]
)]
#[OA\Schema(
    schema: "PaginacaoLinks",
    properties: [
        new OA\Property(property: "first", type: "string", nullable: true),
        new OA\Property(property: "last", type: "string", nullable: true),
        new OA\Property(property: "prev", type: "string", nullable: true),
        new OA\Property(property: "next", type: "string", nullable: true),
    ]
)]
#[OA\Schema(
    schema: "PaginacaoMeta",
    properties: [
        new OA\Property(property: "current_page", type: "integer", example: 1),
        new OA\Property(property: "from", type: "integer", example: 1),
        new OA\Property(property: "last_page", type: "integer", example: 1),
        new OA\Property(property: "per_page", type: "integer", example: 15),
        new OA\Property(property: "to", type: "integer", example: 5),
        new OA\Property(property: "total", type: "integer", example: 5),
    ]
)]

// --- Schemas do Módulo de Treinos ---

#[OA\Schema(
    schema: "ExercicioResource",
    properties: [
        new OA\Property(property: "id", type: "integer", example: 1),
        new OA\Property(property: "nome", type: "string", example: "Supino Reto com Barra"),
        new OA\Property(property: "tipo", type: "string", enum: ["superior", "inferior", "core", "cardio", "full_body"], example: "superior"),
        new OA\Property(property: "grupo_muscular", type: "string", enum: ["peitoral", "costas", "ombros", "biceps", "triceps", "quadriceps", "posterior_coxa", "gluteos", "panturrilhas", "abdomen", "outro"], example: "peitoral"),
        new OA\Property(property: "video_url", type: "string", nullable: true, example: "https://www.youtube.com/watch?v=exemplo"),
        new OA\Property(property: "instrucoes", type: "string", nullable: true, example: "Mantenha as escápulas retraídas durante todo o movimento."),
        new OA\Property(property: "is_global", type: "boolean", example: false, description: "true se for um exercício da base global (personal_id = null)"),
        new OA\Property(property: "cadastrado_em", type: "string", format: "date-time", example: "2026-05-01 10:00:00"),
    ]
)]
#[OA\Schema(
    schema: "FichaSemanaResource",
    properties: [
        new OA\Property(property: "id", type: "integer", example: 1),
        new OA\Property(property: "numero_semana", type: "integer", example: 1),
        new OA\Property(property: "descricao_fase", type: "string", example: "Adaptação Inicial"),
        new OA\Property(property: "repeticoes_alvo", type: "string", example: "12-15"),
        new OA\Property(property: "rir_alvo", type: "integer", nullable: true, example: 2),
        new OA\Property(property: "intensidade_carga", type: "string", nullable: true, example: "Leve a Moderada"),
    ]
)]
#[OA\Schema(
    schema: "RotinaExercicioResource",
    properties: [
        new OA\Property(property: "id", type: "integer", example: 1),
        new OA\Property(property: "ordem", type: "integer", example: 1),
        new OA\Property(property: "tipo_serie", type: "string", enum: ["aquecimento", "preparacao", "trabalho", "mista"], example: "trabalho"),
        new OA\Property(property: "series", type: "integer", example: 4),
        new OA\Property(property: "repeticoes", type: "string", nullable: true, example: "12"),
        new OA\Property(property: "rir", type: "integer", nullable: true, example: 2),
        new OA\Property(property: "carga_sugerida", type: "string", nullable: true, example: "20kg cada lado"),
        new OA\Property(property: "tecnica_avancada", type: "string", nullable: true, enum: ["nenhuma", "drop-set", "bi-set", "rest-pause", "cluster", "ponto_zero"], example: "nenhuma"),
        new OA\Property(property: "descanso_segundos", type: "integer", nullable: true, example: 90),
        new OA\Property(property: "observacoes", type: "string", nullable: true, example: "Pausa de 1 segundo na fase excêntrica"),
        new OA\Property(property: "exercicio", ref: "#/components/schemas/ExercicioResource", nullable: true),
    ]
)]
#[OA\Schema(
    schema: "RotinaSessaoResource",
    properties: [
        new OA\Property(property: "id", type: "integer", example: 1),
        new OA\Property(property: "letra_nome", type: "string", example: "A"),
        new OA\Property(property: "exercicios", type: "array", items: new OA\Items(ref: "#/components/schemas/RotinaExercicioResource")),
    ]
)]
#[OA\Schema(
    schema: "FichaTreinoResource",
    properties: [
        new OA\Property(property: "id", type: "integer", example: 1),
        new OA\Property(property: "aluno_id", type: "integer", example: 1),
        new OA\Property(property: "nome", type: "string", example: "Hipertrofia Fase 1"),
        new OA\Property(property: "objetivo", type: "string", nullable: true, example: "Aumento de massa muscular"),
        new OA\Property(property: "observacoes_gerais", type: "string", nullable: true, example: "Foco na fase excêntrica"),
        new OA\Property(property: "data_inicio", type: "string", format: "date", example: "2026-05-01"),
        new OA\Property(property: "data_vencimento", type: "string", format: "date", nullable: true, example: "2026-06-01"),
        new OA\Property(property: "aluno", ref: "#/components/schemas/AlunoResource", nullable: true),
        new OA\Property(property: "semanas", type: "array", items: new OA\Items(ref: "#/components/schemas/FichaSemanaResource")),
        new OA\Property(property: "rotinas", type: "array", items: new OA\Items(ref: "#/components/schemas/RotinaSessaoResource")),
        new OA\Property(property: "cadastrado_em", type: "string", format: "date-time", example: "2026-05-01 10:00:00"),
        new OA\Property(property: "atualizado_em", type: "string", format: "date-time", example: "2026-05-01 10:00:00"),
    ]
)]
#[OA\Schema(
    schema: "ArmazenarFichaTreinoBody",
    required: ["aluno_id", "nome", "data_inicio", "semanas", "rotinas"],
    properties: [
        new OA\Property(property: "aluno_id", type: "integer", example: 1, description: "ID do aluno vinculado ao personal autenticado"),
        new OA\Property(property: "nome", type: "string", example: "Hipertrofia Fase 1"),
        new OA\Property(property: "objetivo", type: "string", nullable: true, example: "Aumento de massa muscular"),
        new OA\Property(property: "observacoes_gerais", type: "string", nullable: true, example: "Foco na fase excêntrica"),
        new OA\Property(property: "data_inicio", type: "string", format: "date", example: "2026-05-01"),
        new OA\Property(property: "data_vencimento", type: "string", format: "date", nullable: true, example: "2026-06-01"),
        new OA\Property(
            property: "semanas",
            type: "array",
            items: new OA\Items(
                required: ["numero_semana", "descricao_fase", "repeticoes_alvo"],
                properties: [
                    new OA\Property(property: "numero_semana", type: "integer", example: 1),
                    new OA\Property(property: "descricao_fase", type: "string", example: "Adaptação Inicial"),
                    new OA\Property(property: "repeticoes_alvo", type: "string", example: "12-15"),
                    new OA\Property(property: "rir_alvo", type: "integer", nullable: true, example: 2),
                    new OA\Property(property: "intensidade_carga", type: "string", nullable: true, example: "Leve a Moderada"),
                ]
            )
        ),
        new OA\Property(
            property: "rotinas",
            type: "array",
            items: new OA\Items(
                required: ["letra_nome", "exercicios"],
                properties: [
                    new OA\Property(property: "letra_nome", type: "string", example: "A"),
                    new OA\Property(
                        property: "exercicios",
                        type: "array",
                        items: new OA\Items(
                            required: ["exercicio_id", "ordem", "tipo_serie", "series"],
                            properties: [
                                new OA\Property(property: "exercicio_id", type: "integer", example: 1),
                                new OA\Property(property: "ordem", type: "integer", example: 1),
                                new OA\Property(property: "tipo_serie", type: "string", enum: ["aquecimento", "preparacao", "trabalho", "mista"], example: "trabalho"),
                                new OA\Property(property: "series", type: "integer", example: 4),
                                new OA\Property(property: "repeticoes", type: "string", nullable: true, example: "12"),
                                new OA\Property(property: "rir", type: "integer", nullable: true, example: 2),
                                new OA\Property(property: "carga_sugerida", type: "string", nullable: true, example: "20kg cada lado"),
                                new OA\Property(property: "tecnica_avancada", type: "string", nullable: true, enum: ["nenhuma", "drop-set", "bi-set", "rest-pause", "cluster", "ponto_zero"], example: "nenhuma"),
                                new OA\Property(property: "descanso_segundos", type: "integer", nullable: true, example: 90),
                                new OA\Property(property: "observacoes", type: "string", nullable: true, example: "Pausa de 1 segundo"),
                            ]
                        )
                    ),
                ]
            )
        ),
    ]
)]

// --- Schemas do Módulo App Aluno (Execução) ---

#[OA\Schema(
    schema: "LogSerieResource",
    properties: [
        new OA\Property(property: "id", type: "integer", example: 1),
        new OA\Property(property: "rotina_exercicio_id", type: "integer", example: 1),
        new OA\Property(property: "numero_serie", type: "integer", example: 1),
        new OA\Property(property: "repeticoes_realizadas", type: "integer", example: 12),
        new OA\Property(property: "carga_realizada", type: "string", example: "20kg"),
        new OA\Property(property: "exercicio", ref: "#/components/schemas/RotinaExercicioResource", nullable: true),
    ]
)]
#[OA\Schema(
    schema: "LogSessaoResource",
    properties: [
        new OA\Property(property: "id", type: "integer", example: 1),
        new OA\Property(property: "aluno_id", type: "integer", example: 1),
        new OA\Property(
            property: "rotina_sessao",
            properties: [
                new OA\Property(property: "id", type: "integer", example: 1),
                new OA\Property(property: "letra_nome", type: "string", example: "A"),
            ],
            type: "object",
            nullable: true
        ),
        new OA\Property(property: "data_execucao", type: "string", format: "date", example: "2026-04-24"),
        new OA\Property(property: "esforco_percebido", type: "integer", example: 7),
        new OA\Property(property: "duracao_minutos", type: "integer", example: 55),
        new OA\Property(property: "observacoes_aluno", type: "string", nullable: true, example: "Treino pesado hoje"),
        new OA\Property(property: "series", type: "array", items: new OA\Items(ref: "#/components/schemas/LogSerieResource")),
        new OA\Property(property: "registado_em", type: "string", format: "date-time", example: "2026-04-24 15:00:00"),
    ]
)]
#[OA\Schema(
    schema: "RegistrarSessaoBody",
    required: ["rotina_sessao_id", "data_execucao", "esforco_percebido", "duracao_minutos", "series"],
    properties: [
        new OA\Property(property: "rotina_sessao_id", type: "integer", example: 1, description: "ID da rotina (A, B, C...) que o aluno realizou"),
        new OA\Property(property: "data_execucao", type: "string", format: "date", example: "2026-04-24"),
        new OA\Property(property: "esforco_percebido", type: "integer", example: 7, description: "Percepção Subjetiva de Esforço (PSE), de 1 a 10"),
        new OA\Property(property: "duracao_minutos", type: "integer", example: 55, description: "Duração total da sessão em minutos"),
        new OA\Property(property: "observacoes_aluno", type: "string", nullable: true, example: "Treino pesado hoje"),
        new OA\Property(
            property: "series",
            type: "array",
            items: new OA\Items(
                required: ["rotina_exercicio_id", "numero_serie", "repeticoes_realizadas", "carga_realizada"],
                properties: [
                    new OA\Property(property: "rotina_exercicio_id", type: "integer", example: 1, description: "ID do exercício da rotina (prescrição original)"),
                    new OA\Property(property: "numero_serie", type: "integer", example: 1),
                    new OA\Property(property: "repeticoes_realizadas", type: "integer", example: 12),
                    new OA\Property(property: "carga_realizada", type: "string", example: "20kg cada lado"),
                ]
            )
        ),
    ]
)]
class SwaggerInfo
{
}
