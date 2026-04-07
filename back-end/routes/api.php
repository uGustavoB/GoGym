<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AutenticacaoController;

// Rotas públicas
Route::post('register', [AutenticacaoController::class, 'registrar']);
Route::post('login', [AutenticacaoController::class, 'entrar']);

// Aqui vai todas as rotas protegidas, ou seja, aquelas que exigem autenticação para serem acessadas.
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/sair', [AutenticacaoController::class, 'sair']);

//  Rotas para CRUD dos personais
    Route::apiResource('personal', \App\Http\Controllers\PersonalController::class);
});
