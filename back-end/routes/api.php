<?php

use App\Http\Controllers\AlunoController;
use App\Http\Controllers\PersonalController;
use App\Http\Controllers\VerificacaoEmailController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AutenticacaoController;

// Rotas públicas
Route::prefix('registrar')->group(function () {
    Route::post('/personal', [AutenticacaoController::class, 'registrarPersonal']);
    Route::post('/aluno', [AutenticacaoController::class, 'registrarAluno']);
});

Route::post('/login', [AutenticacaoController::class, 'entrar']);

// Rotas de verificação do e-mail
Route::get('/email/verificar/{id}/{hash}', [VerificacaoEmailController::class, 'verificar'])
    ->name('verification.verify');

// Aqui vai todas as rotas protegidas, ou seja, aquelas que exigem autenticação para serem acessadas.
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/perfil', [AutenticacaoController::class, 'perfil']);
    Route::post('/sair', [AutenticacaoController::class, 'sair']);

    // Reenvio do email de verificação (precisa estar logado, mas não necessariamente com email verificado.
    Route::post('/email/reenviar', [VerificacaoEmailController::class, 'reenviar'])
        ->name('verification.send');

    Route::middleware('verified')->group(function () {
        //  Rotas para CRUD dos personais
        Route::apiResource('personal', PersonalController::class);
        Route::post('/personal/gerar-convite', [PersonalController::class, 'gerarConvite']);

        //  Rotas para CRUD de alunos
        Route::apiResource('aluno', AlunoController::class);
    });
});
