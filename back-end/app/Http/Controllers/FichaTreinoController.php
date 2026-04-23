<?php

namespace App\Http\Controllers;

use App\Http\Requests\Treinos\ArmazenarFichaTreinoRequest;
use App\Models\FichaTreino;
use App\Services\FichaTreinoService;
use Illuminate\Http\JsonResponse;

class FichaTreinoController extends Controller
{
    protected FichaTreinoService $servico;

    public function __construct(FichaTreinoService $servico) {
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
    public function store(ArmazenarFichaTreinoRequest $requisicao): JsonResponse
    {
        try {
            $fichaTreino = $this->servico->criar(
                $requisicao->validated(),
                $requisicao->user()->personal->id
            );

            return response()->json([
                'mensagem' => 'Ficha de treino criada com sucesso.',
                'data' => $fichaTreino,
            ], 201);
        } catch (\Throwable) {
            return response()->json([
                'mensagem' => 'Erro interno ao salvar a ficha de treino. Tente novamente.',
            ], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(FichaTreino $fichaTreino): JsonResponse
    {
        $ficha = $this->servico->buscarComRelacionamentos($fichaTreino);

        return response()->json(['data' => $ficha]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(FichaTreino $fichaTreino): JsonResponse
    {
        $this->servico->deletar($fichaTreino);

        return response()->json([
            'mensagem' => 'Ficha de treino excluída com sucesso.',
        ]);
    }
}
