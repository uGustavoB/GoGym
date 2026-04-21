<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class VerificacaoEmailController extends Controller
{
    #[OA\Get(
        path: "/email/verificar/{id}/{hash}",
        operationId: "verificarEmail",
        description: "Valida o link de verificação enviado por e-mail. A URL contém uma assinatura temporária que expira em 60 minutos. Este endpoint é acessado diretamente pelo link do e-mail.",
        summary: "Verificar endereço de e-mail",
        tags: ["Verificação de E-mail"],
        parameters: [
            new OA\Parameter(name: "id", description: "ID do usuário", in: "path", required: true, schema: new OA\Schema(type: "integer", example: 1)),
            new OA\Parameter(name: "hash", description: "Hash SHA1 do e-mail do usuário", in: "path", required: true, schema: new OA\Schema(type: "string")),
            new OA\Parameter(name: "expires", description: "Timestamp de expiração da URL assinada", in: "query", required: true, schema: new OA\Schema(type: "integer")),
            new OA\Parameter(name: "signature", description: "Assinatura criptográfica da URL", in: "query", required: true, schema: new OA\Schema(type: "string")),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "E-mail verificado com sucesso",
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: "mensagem", type: "string", example: "E-mail verificado com sucesso!"),
                ])
            ),
            new OA\Response(
                response: 403,
                description: "Link inválido, expirado ou hash incorreto",
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: "mensagem", type: "string", example: "Link de verificação inválido ou expirado."),
                ])
            ),
            new OA\Response(response: 404, description: "Usuário não encontrado", content: new OA\JsonContent(ref: "#/components/schemas/ErroNaoEncontrado")),
        ]
    )]
    public function verificar(Request $request, int $id, string $hash): JsonResponse
    {
        $usuario = Usuario::findOrFail($id);

        $expires = $request->query('expires');
        $signature = $request->query('signature');

        // Confere se o link expirou
        if (!$expires || Carbon::now()->getTimestamp() > $expires) {
            return response()->json([
                'mensagem' => 'Link de verificação inválido ou expirado.',
            ], 403);
        }

        // Valida a assinatura com a mesma regra independente de host do gerador
        $expectedSignature = hash_hmac('sha256', "{$id}|{$hash}|{$expires}", config('app.key'));

        if (!hash_equals((string) $signature, $expectedSignature)) {
            return response()->json([
                'mensagem' => 'Link de verificação inválido ou corrompido.',
            ], 403);
        }

        // Confere o hash do e-mail
        if (! hash_equals($hash, sha1($usuario->getEmailForVerification()))) {
            return response()->json([
                'mensagem' => 'Hash de verificação inválido.',
            ], 403);
        }

        if ($usuario->hasVerifiedEmail()) {
            return response()->json([
                'mensagem' => 'E-mail já verificado anteriormente.',
            ]);
        }

        $usuario->markEmailAsVerified();
        event(new Verified($usuario));

        return response()->json([
            'mensagem' => 'E-mail verificado com sucesso!',
        ]);
    }

    #[OA\Post(
        path: "/email/reenviar",
        operationId: "reenviarVerificacao",
        description: "Reenvia o e-mail de verificação para o usuário autenticado. Requer autenticação, mas não requer e-mail verificado.",
        summary: "Reenviar e-mail de verificação",
        security: [["sanctum" => []]],
        tags: ["Verificação de E-mail"],
        responses: [
            new OA\Response(
                response: 200,
                description: "E-mail de verificação reenviado",
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: "mensagem", type: "string", example: "E-mail de verificação reenviado."),
                ])
            ),
            new OA\Response(response: 401, description: "Não autenticado", content: new OA\JsonContent(ref: "#/components/schemas/ErroNaoAutenticado")),
            new OA\Response(
                response: 422,
                description: "E-mail já verificado",
                content: new OA\JsonContent(properties: [
                    new OA\Property(property: "mensagem", type: "string", example: "E-mail já verificado."),
                ])
            ),
        ]
    )]
    public function reenviar(Request $request): JsonResponse
    {
        $usuario = $request->user();

        if ($usuario->hasVerifiedEmail()) {
            return response()->json([
                'mensagem' => 'E-mail já verificado.',
            ], 422);
        }

        $usuario->sendEmailVerificationNotification();

        return response()->json([
            'mensagem' => 'E-mail de verificação reenviado.',
        ]);
    }
}
