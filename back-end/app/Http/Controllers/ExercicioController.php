<?php

namespace App\Http\Controllers;

use App\Http\Requests\Exercicios\ArmazenarExercicioRequest;
use App\Http\Requests\Exercicios\AtualizarExercicioRequest;
use App\Models\Exercicio;
use App\Services\ExercicioService;
use Illuminate\Http\JsonResponse;

class ExercicioController extends Controller
{
    protected ExercicioService $servico;

    public function __construct(ExercicioService $servico) {
        $this->servico = $servico;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        return response()->json($this->servico->listar());
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ArmazenarExercicioRequest $requisicao): JsonResponse
    {
        $exercicio = $this->servico->criar(
            $requisicao->validated(),
            $requisicao->user()->personal->id
        );

        return response()->json([
            'mensagem' => 'Exercício criado com sucesso.',
            'data' => $exercicio,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Exercicio $exercicio): JsonResponse
    {
        return response()->json(['data' => $exercicio]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(AtualizarExercicioRequest $requisicao, Exercicio $exercicio): JsonResponse
    {
        $exercicioAtualizado = $this->servico->atualizar(
            $exercicio,
            $requisicao->validated(),
            $requisicao->user()->personal->id
        );

        return response()->json([
            'mensagem' => 'Exercício atualizado com sucesso.',
            'data' => $exercicioAtualizado,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Exercicio $exercicio): JsonResponse
    {
        $this->servico->deletar(
            $exercicio,
            auth()->user()->personal->id
        );

        return response()->json([
            'mensagem' => 'Exercício excluído com sucesso.',
        ]);
    }
}
