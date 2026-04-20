<?php

namespace App\Services;

use App\Models\Aluno;
use App\Models\Convite;
use App\Notifications\ConviteAlunoNotification;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;

class ConviteService
{
    public function gerarConvite(array $dados)
    {
        // Verifica se já existe um convite pendente para este email
        $conviteExistente = Convite::where('email', $dados['email'])
            ->where('status', 'pendente')
            ->first();

        if ($conviteExistente) {
            Notification::route('mail', $dados['email'])
                ->notify(new ConviteAlunoNotification(
                    $dados['nome'],
                    $dados['nome_personal'],
                    $dados['email'],
                    $conviteExistente->token
                ));
            return $conviteExistente;
        }

        $convite = Convite::create([
            'personal_id' => $dados['personal_id'],
            'email' => $dados['email'],
            'token' => Str::random(60),
            'status' => 'pendente'
        ]);

        Notification::route('mail', $dados['email'])
            ->notify(new ConviteAlunoNotification(
                $dados['nome'],
                $dados['nome_personal'],
                $dados['email'],
                $convite->token
            ));

        return $convite;
    }

    public function vincularAlunoPorToken(?string $token, Aluno $aluno): void
    {
        if (!$token) return;

        $convite = Convite::where('token', $token)
            ->where('status', 'pendente')
            ->first();

        if ($convite) {
            $aluno->personais()->attach($convite->personal_id, [
                'status' => 'ativo'
            ]);

            $convite->update(['status' => 'aceito']);
        }
    }
}
