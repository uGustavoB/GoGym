<?php

namespace App\Http\Controllers;

use App\Http\Requests\Alunos\ArmazenarAlunoRequest;
use App\Http\Requests\Alunos\AtualizarAlunoRequest;
use App\Http\Resources\AlunoResource;
use App\Models\Aluno;
use App\Services\AlunoService;

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
    public function index()
    {
        $alunos = $this->servico->listar();
        return AlunoResource::collection($alunos);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(ArmazenarAlunoRequest $requisicao)
    {
        $dadosValidados = $requisicao->validated();

        if ($requisicao->user()) {
            $dadosValidados['usuario_id'] = $requisicao->user()->id;
        }

        $aluno = $this->servico->criar($dadosValidados);

        return new AlunoResource($aluno);
    }

    /**
     * Display the specified resource.
     */
    public function show(Aluno $aluno)
    {
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
