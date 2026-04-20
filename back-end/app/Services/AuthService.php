<?php

namespace App\Services;

use App\Models\Usuario;
use App\Notifications\RedefinirSenhaNotification;
use Carbon\Carbon;
use Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
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

    public function enviarEmailRedefinicao(array $dados): void
    {
        $usuario = Usuario::where('email', $dados['email'])->first();

        if (!$usuario) {
            throw ValidationException::withMessages([
                'email' => ['Não encontramos um usuário com este endereço de e-mail.'],
            ]);
        }

        $token = Str::random(64);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $usuario->email],
            [
                'token' => Hash::make($token),
                'created_at' => Carbon::now()
            ]
        );

        $usuario->notify(new RedefinirSenhaNotification($token));
    }

    public function redefinirSenha(array $dados): void
    {
        $registro = DB::table('password_reset_tokens')->where('email', $dados['email'])->first();

        // Verifica se o token existe e bate com o hash
        if (!$registro || !Hash::check($dados['token'], $registro->token)) {
            throw ValidationException::withMessages([
                'email' => ['Este token de redefinição de senha é inválido ou não pertence a este e-mail.'],
            ]);
        }

        // Verifica se expirou
        if (Carbon::parse($registro->created_at)->addMinutes(60)->isPast()) {
            DB::table('password_reset_tokens')->where('email', $dados['email'])->delete();
            throw ValidationException::withMessages([
                'email' => ['Este token de redefinição de senha expirou. Por favor, solicite um novo.'],
            ]);
        }

        $usuario = Usuario::where('email', $dados['email'])->first();
        $usuario->senha = Hash::make($dados['senha']);
        $usuario->save();

        DB::table('password_reset_tokens')->where('email', $dados['email'])->delete();

        // Revoga os tokens de acesso antigos para obrigar um novo login
        $usuario->tokens()->delete();
    }
}
