<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegistrarRequest;
use App\Services\AuthService;
use Illuminate\Http\Request;

class AutenticacaoController extends Controller
{
    private AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    public function registrar(RegistrarRequest $request)
    {
        $resultado = $this->authService->registrar($request->validated());

        return response()->json($resultado, 201);
    }

    public function entrar(LoginRequest $request)
    {
        $resultado = $this->authService->login($request->validated());

        return response()->json($resultado);
    }

    public function sair(Request $request)
    {
        $this->authService->logout($request->user());

        return response()->json([
            'mensagem' => 'Desconectado com sucesso.'
        ]);
    }
}
