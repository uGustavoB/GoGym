<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegistrarAlunoRequest;
use App\Http\Requests\RegistrarPersonalRequest;
use App\Services\AlunoService;
use App\Services\AuthService;
use App\Services\PersonalService;
use Illuminate\Http\Request;

class AutenticacaoController extends Controller
{
    private AuthService $authService;
    protected $personalService;
    protected $alunoService;

    public function __construct(AuthService $authService, PersonalService $personalService, AlunoService $alunoService)
    {
        $this->authService = $authService;
        $this->personalService = $personalService;
        $this->alunoService = $alunoService;
    }

    public function registrarPersonal(RegistrarPersonalRequest $requisicao)
    {
        $resultado = $this->personalService->registrarComUsuario($requisicao->validated());

        return response()->json([
            'mensagem' => 'Personal registrado com sucesso.',
            'dados' => $resultado['personal'],
            'token' => $resultado['token']
        ], 201);
    }

    public function registrarAluno(RegistrarAlunoRequest $requisicao)
    {
        $resultado = $this->alunoService->registrarComUsuario($requisicao->validated());

        return response()->json([
            'mensagem' => 'Aluno registrado com sucesso.',
            'dados' => $resultado['aluno'],
            'token' => $resultado['token']
        ], 201);
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

    public function perfil(Request $requisicao)
    {
        return response()->json([
            'usuario' => $requisicao->user()
        ]);
    }
}
