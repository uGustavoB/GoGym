<?php

namespace App\Http\Controllers;

use App\Http\Requests\Personais\ArmazenarPersonalRequest;
use App\Http\Requests\Personais\AtualizarPersonalRequest;
use App\Http\Requests\Personais\GerarConviteRequest;
use App\Http\Resources\PersonalResource;
use App\Models\Personal;
use App\Services\PersonalService;

class PersonalController extends Controller
{
    protected $servico;

    public function __construct(PersonalService $servico)
    {
        $this->servico = $servico;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $personais = $this->servico->listar();
        return PersonalResource::collection($personais);
    }

    /**
     * Display the specified resource.
     */
    public function show(Personal $personal)
    {
        return new PersonalResource($personal->load('usuario'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(AtualizarPersonalRequest $requisicao, Personal $personal)
    {
        $personalAtualizado = $this->servico->atualizar($personal, $requisicao->validated());
        return new PersonalResource($personalAtualizado);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Personal $personal)
    {
        $this->servico->deletar($personal);
        return response()->json(['mensagem' => 'Personal inativado com sucesso.']);
    }

    public function gerarConvite(GerarConviteRequest $requisicao)
    {
        $dados = $requisicao->validated();

        $personalId = $this->servico
            ->buscarPorUsuarioId($requisicao->user()->id)
            ->first()
            ->id;

        $dados['personal_id'] = $personalId;

        $convite = app(\App\Services\ConviteService::class)
            ->gerarConvite($dados);

        return response()->json([
            'mensagem' => 'Convite gerado com sucesso.',
            'convite' => [
                'email' => $convite->email,
                'token' => $convite->token,
                'status' => $convite->status,
            ]
        ]);
    }
}
