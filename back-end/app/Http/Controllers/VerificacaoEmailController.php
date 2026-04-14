<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VerificacaoEmailController extends Controller
{
    public function verificar(Request $request, int $id, string $hash): JsonResponse
    {
        $usuario = Usuario::findOrFail($id);

        // Valida a assinatura da URL
        if (! $request->hasValidSignature()) {
            return response()->json([
                'mensagem' => 'Link de verificação inválido ou expirado.',
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
