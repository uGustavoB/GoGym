<?php

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    // Resumo geral
    public function resumoPersonal(int $personalId): array
    {
        $alunosAtivosIds = $this->alunosAtivosDoPersonal($personalId);

        return [
            'total_alunos_ativos' => $alunosAtivosIds->count(),
            'adesao_semanal' => $this->taxaAdesaoSemanal($personalId, $alunosAtivosIds),
            'media_esforco_global' => $this->mediaEsforcoGlobal($alunosAtivosIds),
            'top_frequentes' => $this->rankingFrequencia($alunosAtivosIds, 'desc', 3),
            'menos_frequentes' => $this->rankingFrequencia($alunosAtivosIds, 'asc', 3),
        ];
    }

    // Resumo de um aluno específico
    public function resumoAluno(int $alunoId): array
    {
        $sessoes = DB::table('logs_sessoes')
            ->where('aluno_id', $alunoId)
            ->selectRaw('
                COUNT(*) as total_sessoes,
                AVG(duracao_minutos) as media_duracao,
                AVG(esforco_percebido) as media_esforco,
                MAX(data_execucao) as ultima_sessao
            ')
            ->first();

        return [
            'total_sessoes' => (int) ($sessoes->total_sessoes ?? 0),
            'media_duracao_minutos' => round((float) ($sessoes->media_duracao ?? 0), 1),
            'media_esforco' => round((float) ($sessoes->media_esforco ?? 0), 1),
            'ultima_sessao' => $sessoes->ultima_sessao,
            'sequencia_dias' => $this->calcularSequencia($alunoId),
            'melhor_sequencia' => $this->calcularMelhorSequencia($alunoId),
        ];
    }

    // Progressão de um aluno específico
    public function progressoAluno(int $alunoId, string $period = '30d'): array
    {
        $dataInicio = $this->resolverPeriodo($period);

        return [
            'periodo' => $period,
            'volume_load_semanal' => $this->volumeLoadSemanal($alunoId, $dataInicio),
            'carga_maxima_por_exercicio' => $this->cargaMaximaPorExercicio($alunoId, $dataInicio),
            'esforco_por_sessao' => $this->esforcoPorSessao($alunoId, $dataInicio),
            'frequencia_semanal' => $this->frequenciaSemanal($alunoId, $dataInicio),
        ];
    }

    // Histórico de um exercício específico para um aluno
    public function historicoExercicio(int $alunoId, int $exercicioId, string $period = '30d'): array
    {
        $dataInicio = $this->resolverPeriodo($period);

        $query = DB::table('logs_series')
            ->join('logs_sessoes', 'logs_series.log_sessao_id', '=', 'logs_sessoes.id')
            ->join('rotinas_exercicios', 'logs_series.rotina_exercicio_id', '=', 'rotinas_exercicios.id')
            ->where('logs_sessoes.aluno_id', $alunoId)
            ->where('rotinas_exercicios.exercicio_id', $exercicioId);

        if ($dataInicio) {
            $query->where('logs_sessoes.data_execucao', '>=', $dataInicio);
        }

        $series = $query
            ->select([
                'logs_sessoes.data_execucao',
                'logs_series.numero_serie',
                'logs_series.repeticoes_realizadas',
                DB::raw("CAST(REPLACE(logs_series.carga_realizada, 'kg', '') AS DECIMAL(10,2)) as carga"),
            ])
            ->orderBy('logs_sessoes.data_execucao')
            ->orderBy('logs_series.numero_serie')
            ->get();

        // Agrupar por data de execução
        $historico = $series->groupBy('data_execucao')->map(function (Collection $seriesDoDia, string $data) {
            $seriesFormatadas = $seriesDoDia->map(fn ($s) => [
                'numero_serie' => (int) $s->numero_serie,
                'repeticoes' => (int) $s->repeticoes_realizadas,
                'carga' => (float) $s->carga,
            ])->values();

            $cargaMaxima = $seriesDoDia->max('carga');
            $volumeSessao = $seriesDoDia->sum(fn ($s) => (float) $s->carga * (int) $s->repeticoes_realizadas);

            return [
                'data' => $data,
                'series' => $seriesFormatadas,
                'carga_maxima' => (float) $cargaMaxima,
                'volume_sessao' => round($volumeSessao, 2),
            ];
        })->values();

        $exercicio = DB::table('exercicios')->where('id', $exercicioId)->first(['id', 'nome']);

        return [
            'exercicio' => $exercicio ? ['id' => $exercicio->id, 'nome' => $exercicio->nome] : null,
            'periodo' => $period,
            'historico' => $historico,
        ];
    }

    // Alunos ativos do personal

    private function alunosAtivosDoPersonal(int $personalId): Collection
    {
        return DB::table('aluno_personal')
            ->where('personal_id', $personalId)
            ->where('status', 'ativo')
            ->pluck('aluno_id');
    }

    private function taxaAdesaoSemanal(int $personalId, Collection $alunosIds): array
    {
        if ($alunosIds->isEmpty()) {
            return ['sessoes_planejadas' => 0, 'sessoes_concluidas' => 0, 'taxa_percentual' => 0];
        }

        $inicioSemana = Carbon::now()->startOfWeek();
        $fimSemana = Carbon::now()->endOfWeek();

        // Sessões planejadas = nº de rotinas distintas por aluno ativo com ficha vigente
        $sessoesPlanejadasPorAluno = DB::table('fichas_treinos')
            ->join('rotinas_sessoes', 'fichas_treinos.id', '=', 'rotinas_sessoes.ficha_treino_id')
            ->where('fichas_treinos.personal_id', $personalId)
            ->whereIn('fichas_treinos.aluno_id', $alunosIds)
            ->whereNull('fichas_treinos.deleted_at')
            ->whereNull('rotinas_sessoes.deleted_at')
            ->where('fichas_treinos.data_inicio', '<=', $fimSemana)
            ->where(function ($q) use ($inicioSemana) {
                $q->whereNull('fichas_treinos.data_vencimento')
                    ->orWhere('fichas_treinos.data_vencimento', '>=', $inicioSemana);
            })
            ->count();

        // Sessões concluídas nesta semana
        $sessoesConcluidas = DB::table('logs_sessoes')
            ->whereIn('aluno_id', $alunosIds)
            ->whereBetween('data_execucao', [$inicioSemana->toDateString(), $fimSemana->toDateString()])
            ->count();

        $taxa = $sessoesPlanejadasPorAluno > 0
            ? round(($sessoesConcluidas / $sessoesPlanejadasPorAluno) * 100, 2)
            : 0;

        return [
            'sessoes_planejadas' => $sessoesPlanejadasPorAluno,
            'sessoes_concluidas' => $sessoesConcluidas,
            'taxa_percentual' => $taxa,
        ];
    }

    private function mediaEsforcoGlobal(Collection $alunosIds): float
    {
        if ($alunosIds->isEmpty()) {
            return 0;
        }

        $media = DB::table('logs_sessoes')
            ->whereIn('aluno_id', $alunosIds)
            ->where('data_execucao', '>=', Carbon::now()->subDays(30))
            ->avg('esforco_percebido');

        return round((float) ($media ?? 0), 1);
    }

    private function rankingFrequencia(Collection $alunosIds, string $direcao, int $limite): array
    {
        if ($alunosIds->isEmpty()) {
            return [];
        }

        return DB::table('logs_sessoes')
            ->join('alunos', 'logs_sessoes.aluno_id', '=', 'alunos.id')
            ->join('usuarios', 'alunos.usuario_id', '=', 'usuarios.id')
            ->whereIn('logs_sessoes.aluno_id', $alunosIds)
            ->where('logs_sessoes.data_execucao', '>=', Carbon::now()->subDays(30))
            ->groupBy('logs_sessoes.aluno_id', 'usuarios.nome')
            ->select([
                'logs_sessoes.aluno_id',
                'usuarios.nome',
                DB::raw('COUNT(*) as sessoes'),
            ])
            ->orderBy('sessoes', $direcao)
            ->limit($limite)
            ->get()
            ->map(fn ($row) => [
                'aluno_id' => $row->aluno_id,
                'nome'     => $row->nome,
                'sessoes'  => (int) $row->sessoes,
            ])
            ->toArray();
    }

    // Total de volume por semana

    private function volumeLoadSemanal(int $alunoId, ?Carbon $dataInicio): Collection
    {
        $query = DB::table('logs_series')
            ->join('logs_sessoes', 'logs_series.log_sessao_id', '=', 'logs_sessoes.id')
            ->where('logs_sessoes.aluno_id', $alunoId);

        if ($dataInicio) {
            $query->where('logs_sessoes.data_execucao', '>=', $dataInicio);
        }

        return $query
            ->selectRaw("
                YEARWEEK(logs_sessoes.data_execucao, 1) as semana_codigo,
                MIN(logs_sessoes.data_execucao) as inicio_semana,
                ROUND(SUM(
                    CAST(REPLACE(logs_series.carga_realizada, 'kg', '') AS DECIMAL(10,2))
                    * logs_series.repeticoes_realizadas
                ), 2) as volume_load
            ")
            ->groupByRaw('YEARWEEK(logs_sessoes.data_execucao, 1)')
            ->orderBy('semana_codigo')
            ->get()
            ->map(fn ($row) => [
                'semana'        => $this->yearWeekToLabel($row->semana_codigo),
                'inicio_semana' => $row->inicio_semana,
                'volume_load'   => (float) $row->volume_load,
            ]);
    }

    // Carga máxima por exercício
    private function cargaMaximaPorExercicio(int $alunoId, ?Carbon $dataInicio): Collection
    {
        $query = DB::table('logs_series')
            ->join('logs_sessoes', 'logs_series.log_sessao_id', '=', 'logs_sessoes.id')
            ->join('rotinas_exercicios', 'logs_series.rotina_exercicio_id', '=', 'rotinas_exercicios.id')
            ->join('exercicios', 'rotinas_exercicios.exercicio_id', '=', 'exercicios.id')
            ->where('logs_sessoes.aluno_id', $alunoId);

        if ($dataInicio) {
            $query->where('logs_sessoes.data_execucao', '>=', $dataInicio);
        }

        $resultados = $query
            ->selectRaw("
                exercicios.id as exercicio_id,
                exercicios.nome as exercicio_nome,
                YEARWEEK(logs_sessoes.data_execucao, 1) as semana_codigo,
                MAX(CAST(REPLACE(logs_series.carga_realizada, 'kg', '') AS DECIMAL(10,2))) as carga_maxima
            ")
            ->groupByRaw('exercicios.id, exercicios.nome, YEARWEEK(logs_sessoes.data_execucao, 1)')
            ->orderBy('exercicio_id')
            ->orderBy('semana_codigo')
            ->get();

        return $resultados->groupBy('exercicio_id')->map(function (Collection $registros) {
            $primeiro = $registros->first();

            return [
                'exercicio_id' => $primeiro->exercicio_id,
                'exercicio_nome' => $primeiro->exercicio_nome,
                'evolucao' => $registros->map(fn ($r) => [
                    'semana' => $this->yearWeekToLabel($r->semana_codigo),
                    'carga_maxima' => (float) $r->carga_maxima,
                ])->values(),
            ];
        })->values();
    }

    // Esforço percebido por sessão
    private function esforcoPorSessao(int $alunoId, ?Carbon $dataInicio): Collection
    {
        $query = DB::table('logs_sessoes')
            ->where('aluno_id', $alunoId);

        if ($dataInicio) {
            $query->where('data_execucao', '>=', $dataInicio);
        }

        return $query
            ->select(['data_execucao', 'esforco_percebido', 'duracao_minutos'])
            ->orderBy('data_execucao')
            ->get()
            ->map(fn ($row) => [
                'data' => $row->data_execucao,
                'esforco_percebido' => (int) $row->esforco_percebido,
                'duracao_minutos' => (int) $row->duracao_minutos,
            ]);
    }

    // Frequência semanal (nº de sessões e duração média por semana)
    private function frequenciaSemanal(int $alunoId, ?Carbon $dataInicio): Collection
    {
        $query = DB::table('logs_sessoes')
            ->where('aluno_id', $alunoId);

        if ($dataInicio) {
            $query->where('data_execucao', '>=', $dataInicio);
        }

        return $query
            ->selectRaw("
                YEARWEEK(data_execucao, 1) as semana_codigo,
                COUNT(*) as sessoes,
                ROUND(AVG(duracao_minutos), 1) as duracao_media
            ")
            ->groupByRaw('YEARWEEK(data_execucao, 1)')
            ->orderBy('semana_codigo')
            ->get()
            ->map(fn ($row) => [
                'semana' => $this->yearWeekToLabel($row->semana_codigo),
                'sessoes' => (int) $row->sessoes,
                'duracao_media' => (float) $row->duracao_media,
            ]);
    }

    // Sequência atual de dias com sessões registradas (ex: 3 se o aluno treinou nos últimos 3 dias consecutivos, incluindo hoje)
    private function calcularSequencia(int $alunoId): int
    {
        $datas = DB::table('logs_sessoes')
            ->where('aluno_id', $alunoId)
            ->orderByDesc('data_execucao')
            ->pluck('data_execucao')
            ->map(fn ($d) => Carbon::parse($d)->toDateString())
            ->unique()
            ->values();

        if ($datas->isEmpty()) {
            return 0;
        }

        $sequencia = 0;
        $hoje = Carbon::today();

        foreach ($datas as $data) {
            $esperado = $hoje->copy()->subDays($sequencia)->toDateString();

            if ($data === $esperado) {
                $sequencia++;
            } else {
                break;
            }
        }

        return $sequencia;
    }

    private function calcularMelhorSequencia(int $alunoId): int
    {
        $datas = DB::table('logs_sessoes')
            ->where('aluno_id', $alunoId)
            ->orderBy('data_execucao')
            ->pluck('data_execucao')
            ->map(fn ($d) => Carbon::parse($d)->toDateString())
            ->unique()
            ->values();

        if ($datas->isEmpty()) {
            return 0;
        }

        $melhor = 1;
        $atual = 1;

        for ($i = 1; $i < $datas->count(); $i++) {
            $diff = Carbon::parse($datas[$i - 1])->diffInDays(Carbon::parse($datas[$i]));

            if ($diff === 1) {
                $atual++;
                $melhor = max($melhor, $atual);
            } else {
                $atual = 1;
            }
        }

        return $melhor;
    }

    private function resolverPeriodo(string $period): ?Carbon
    {
        return match ($period) {
            '7d' => Carbon::now()->subDays(7),
            '30d' => Carbon::now()->subDays(30),
            '3m' => Carbon::now()->subMonths(3),
            '6m' => Carbon::now()->subMonths(6),
            '1y' => Carbon::now()->subYear(),
            'all' => null,
            default => Carbon::now()->subDays(30),
        };
    }

    private function yearWeekToLabel(int|string $yearWeek): string
    {
        $str = (string) $yearWeek;
        $year = substr($str, 0, 4);
        $week = substr($str, 4);

        return "{$year}-S{$week}";
    }
}
