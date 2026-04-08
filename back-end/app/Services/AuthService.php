<?php

namespace App\Services;

use App\Models\Usuario;
use Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function login(array $dados): array
    {
        $usuario = Usuario::where('email', $dados['email'])->first();

        if (!$usuario || !Hash::check($dados['senha'], $usuario->senha)) {
            throw ValidationException::withMessages([
                'email' => ['As credenciais fornecidas estão incorretas.'],
            ]);
        }

        $token = $usuario->createToken('token_de_acesso')->plainTextToken;

        return [
            'usuario' => $usuario,
            'token' => $token
        ];
    }

    public function logout(Usuario $usuario): void
    {
        $usuario->tokens()->delete();
    }

    public function gerarToken(Usuario $usuario): string
    {
        return $usuario->createToken('auth_token')->plainTextToken;
    }
}
