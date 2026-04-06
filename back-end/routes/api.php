<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AutenticacaoController;

// Rotas públicas
Route::post('register', [AutenticacaoController::class, 'registrar']);
Route::post('login', [AutenticacaoController::class, 'entrar']);

//    Aqui vai todas as rotas protegidas, ou seja, aquelas que exigem autenticação para serem acessadas.
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/sair', [AutenticacaoController::class, 'sair']);

    Route::get('/perfil', function (\Illuminate\Http\Request $requisicao) {
        return $requisicao->user();
    });
});
