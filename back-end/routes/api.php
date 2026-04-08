<?php

use App\Http\Controllers\AlunoController;
use App\Http\Controllers\PersonalController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AutenticacaoController;

// Rotas públicas
Route::prefix('registrar')->group(function () {
    Route::post('/personal', [AutenticacaoController::class, 'registrarPersonal']);
    Route::post('/aluno', [AutenticacaoController::class, 'registrarAluno']);
});

//  Rotas para CRUD dos personais
Route::apiResource('personal', PersonalController::class);

//  Rotas para CRUD de alunos
Route::apiResource('aluno', AlunoController::class);

// Aqui vai todas as rotas protegidas, ou seja, aquelas que exigem autenticação para serem acessadas.
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/perfil', [AutenticacaoController::class, 'perfil']);
    Route::post('/login', [AutenticacaoController::class, 'entrar']);
    Route::post('/sair', [AutenticacaoController::class, 'sair']);

    Route::post('/personal/gerar-convite', [PersonalController::class, 'gerarConvite']);
});
