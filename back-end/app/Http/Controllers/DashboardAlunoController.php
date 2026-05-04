<?php

namespace App\Http\Controllers;

use App\Http\Resources\DashboardAlunoResumoResource;
use App\Http\Resources\HistoricoExercicioResource;
use App\Models\Exercicio;
use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardAlunoController extends Controller
{
    public function __construct(
        private DashboardService $servico
    ) {}

    public function resumo(Request $request): JsonResponse
    {
        $aluno = $request->user()->aluno;

        if (! $aluno) {
            return response()->json([
                'mensagem' => 'Utilizador não é um aluno.',
            ], 403);
        }

        $dados = $this->servico->resumoAluno($aluno->id);

        return response()->json([
            'data' => new DashboardAlunoResumoResource((object) $dados),
        ]);
    }

    public function historicoExercicio(Request $request, Exercicio $exercicio): JsonResponse
    {
        $aluno = $request->user()->aluno;

        if (! $aluno) {
            return response()->json([
                'mensagem' => 'Utilizador não é um aluno.',
            ], 403);
        }

        $period = $request->query('period', '30d');
        $dados = $this->servico->historicoExercicio($aluno->id, $exercicio->id, $period);

        return response()->json([
            'data' => new HistoricoExercicioResource((object) $dados),
        ]);
    }
}
