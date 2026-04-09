<?php

namespace App\Http\Controllers;

use App\Http\Requests\Alunos\AtualizarAlunoRequest;
use App\Http\Resources\AlunoResource;
use App\Models\Aluno;
use App\Services\AlunoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class AlunoController extends Controller
{
    protected $servico;

    public function __construct(AlunoService $servico)
    {
        $this->servico = $servico;
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $requisicao)
    {
        $alunos = $this->servico->listar($requisicao->user());
        return AlunoResource::collection($alunos);
    }

    /**
     * Display the specified resource.
     */
    public function show(Aluno $aluno)
    {
        Gate::authorize('view', $aluno);

        return new AlunoResource($aluno->load('usuario'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(AtualizarAlunoRequest $requisicao, Aluno $aluno)
    {
        $alunoAtualizado = $this->servico->atualizar($aluno, $requisicao->validated());
        return new AlunoResource($alunoAtualizado);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Aluno $aluno)
    {
        $this->servico->deletar($aluno);
        return response()->json(['mensagem' => 'Aluno inativado com sucesso.']);
    }
}
