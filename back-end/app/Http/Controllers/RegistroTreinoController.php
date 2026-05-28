<?php

namespace App\Http\Controllers;

use App\Http\Requests\Treinos\RegistrarSessaoRequest;
use App\Http\Resources\FichaTreinoResource;
use App\Http\Resources\LogSessaoResource;
use App\Services\RegistroTreinoService;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class RegistroTreinoController extends Controller
{
    public function __construct(
        private RegistroTreinoService $servico
    ) {}

    #[OA\Get(
        path: "/registro-treino/meu-treino",
        operationId: "meuTreinoAtual",
        description: "Retorna a ficha de treino ativa do aluno autenticado (onde a data atual está entre data_inicio e data_vencimento). Caso não exista uma ficha no intervalo válido, retorna a mais recente. Inclui semanas de periodização, rotinas e exercícios detalhados via Eager Loading. Requer autenticação via Sanctum (token de aluno) e e-mail verificado.",
        summary: "Obter meu treino atual",
        security: [["sanctum" => []]],
        tags: ["App Aluno - Execução"],
        responses: [
            new OA\Response(
                response: 200,
                description: "Ficha de treino ativa retornada com sucesso",
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: "data", ref: "#/components/schemas/FichaTreinoResource"),
                ])
            ),
            new OA\Response(
                response: 404,
                description: "Nenhuma ficha de treino encontrada",
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: "mensagem", type: "string", example: "Nenhuma ficha de treino encontrada."),
                ])
            ),
            new OA\Response(response: 401, description: "Não autenticado", content: new OA\JsonContent(ref: "#/components/schemas/ErroNaoAutenticado")),
            new OA\Response(response: 403, description: "E-mail não verificado ou não é aluno", content: new OA\JsonContent(ref: "#/components/schemas/ErroNaoAutorizado")),
        ]
    )]
    public function meuTreinoAtual(): JsonResponse
    {
        $aluno = auth()->user()->aluno;

        if (! $aluno) {
            return response()->json([
                'mensagem' => 'Utilizador não é um aluno.',
            ], 403);
        }

        $ficha = $this->servico->buscarTreinoAtual($aluno->id);

        if (! $ficha) {
            return response()->json([
                'mensagem' => 'Nenhuma ficha de treino encontrada.',
            ], 404);
        }

        return response()->json(['data' => new FichaTreinoResource($ficha)]);
    }

    #[OA\Post(
        path: "/registro-treino/registrar-sessao",
        operationId: "registrarSessao",
        description: "Regista a conclusão de uma sessão de treino pelo aluno autenticado. O payload inclui a rotina realizada (A, B, C...), a data de execução, o esforço percebido (PSE 1-10), a duração em minutos e um array de séries com repetições e cargas realizadas. A criação é atômica (transacional). A rotina informada deve pertencer a uma ficha de treino do aluno autenticado (validação de segurança). Requer autenticação via Sanctum (token de aluno) e e-mail verificado.",
        summary: "Registar sessão de treino concluída",
        security: [["sanctum" => []]],
        requestBody: new OA\RequestBody(
            description: "Payload com dados da sessão e séries realizadas",
            required: true,
            content: new OA\JsonContent(ref: "#/components/schemas/RegistrarSessaoBody")
        ),
        tags: ["App Aluno - Execução"],
        responses: [
            new OA\Response(
                response: 201,
                description: "Sessão de treino registada com sucesso",
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: "mensagem", type: "string", example: "Sessão de treino registada com sucesso."),
                    new OA\Property(property: "data", ref: "#/components/schemas/LogSessaoResource"),
                ])
            ),
            new OA\Response(response: 401, description: "Não autenticado", content: new OA\JsonContent(ref: "#/components/schemas/ErroNaoAutenticado")),
            new OA\Response(response: 403, description: "Não autorizado (não é aluno ou rotina não pertence ao aluno)", content: new OA\JsonContent(ref: "#/components/schemas/ErroNaoAutorizado")),
            new OA\Response(response: 422, description: "Erro de validação", content: new OA\JsonContent(ref: "#/components/schemas/ErroValidacao")),
            new OA\Response(
                response: 500,
                description: "Erro interno ao registar",
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: "mensagem", type: "string", example: "Erro interno ao registar a sessão de treino. Tente novamente."),
                ])
            ),
        ]
    )]
    public function registrarSessao(RegistrarSessaoRequest $requisicao): JsonResponse
    {
        try {
            $logSessao = $this->servico->registrarSessao(
                $requisicao->validated(),
                $requisicao->user()->aluno->id
            );

            return response()->json([
                'mensagem' => 'Sessão de treino registada com sucesso.',
                'data' => new LogSessaoResource($logSessao),
            ], 201);
        } catch (\Throwable) {
            return response()->json([
                'mensagem' => 'Erro interno ao registar a sessão de treino. Tente novamente.',
            ], 500);
        }
    }
}
