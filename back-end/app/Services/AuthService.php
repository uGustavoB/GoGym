<?php

namespace App\Services;

use App\Models\Usuario;
use Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function registrar(array $dados): array
    {
        $usuario = Usuario::create([
            'nome' => $dados['nome'],
            'email' => $dados['email'],
            'senha' => Hash::make($dados['senha']),
        ]);

        $token = $usuario->createToken('token_de_acesso')->plainTextToken;

        return [
            'usuario' => $usuario,
            'token' => $token
        ];
    }

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

    public function logout($usuario)
    {
        $usuario->currentAccessToken()->delete();
    }
}
