<?php

namespace App\Http\Controllers;

use App\Http\Resources\DashboardPersonalResumoResource;
use App\Http\Resources\ProgressoAlunoResource;
use App\Models\Aluno;
use App\Services\DashboardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardPersonalController extends Controller
{
    public function __construct(
        private DashboardService $servico
    ) {}

    public function resumo(Request $request): JsonResponse
    {
        $personal = $request->user()->personal;

        if (! $personal) {
            return response()->json([
                'mensagem' => 'Utilizador não é um personal trainer.',
            ], 403);
        }

        $dados = $this->servico->resumoPersonal($personal->id);

        return response()->json([
            'data' => new DashboardPersonalResumoResource((object) $dados),
        ]);
    }

    public function progressoAluno(Request $request, Aluno $aluno): JsonResponse
    {
        $personal = $request->user()->personal;

        if (! $personal) {
            return response()->json([
                'mensagem' => 'Utilizador não é um personal trainer.',
            ], 403);
        }

        // Verificar que o aluno pertence ao personal
        $vinculoExiste = $personal->alunos()
            ->where('alunos.id', $aluno->id)
            ->wherePivot('status', 'ativo')
            ->exists();

        if (! $vinculoExiste) {
            return response()->json([
                'mensagem' => 'Este aluno não está vinculado a você.',
            ], 403);
        }

        $period = $request->query('period', '30d');
        $dados = $this->servico->progressoAluno($aluno->id, $period);

        return response()->json([
            'data' => new ProgressoAlunoResource((object) $dados),
        ]);
    }
}
