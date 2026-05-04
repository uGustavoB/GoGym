import { api } from "@/lib/api"

// ── Types — Dashboard Personal ──

export interface AdesaoSemanal {
  sessoes_planejadas: number
  sessoes_concluidas: number
  taxa_percentual: number
}

export interface RankingAluno {
  aluno_id: number
  nome: string
  sessoes: number
}

export interface PersonalResumo {
  total_alunos_ativos: number
  adesao_semanal: AdesaoSemanal
  media_esforco_global: number
  top_frequentes: RankingAluno[]
  menos_frequentes: RankingAluno[]
}

// ── Types — Progresso Aluno (vista do Personal) ──

export interface VolumeLoadSemanal {
  semana: string
  inicio_semana: string
  volume_load: number
}

export interface EvolucaoCarga {
  semana: string
  carga_maxima: number
}

export interface CargaMaximaExercicio {
  exercicio_id: number
  exercicio_nome: string
  evolucao: EvolucaoCarga[]
}

export interface EsforcoPorSessao {
  data: string
  esforco_percebido: number
  duracao_minutos: number
}

export interface FrequenciaSemanal {
  semana: string
  sessoes: number
  duracao_media: number
}

export interface ProgressoAluno {
  periodo: string
  volume_load_semanal: VolumeLoadSemanal[]
  carga_maxima_por_exercicio: CargaMaximaExercicio[]
  esforco_por_sessao: EsforcoPorSessao[]
  frequencia_semanal: FrequenciaSemanal[]
}

// ── Types — Dashboard Aluno ──

export interface AlunoResumo {
  total_sessoes: number
  media_duracao_minutos: number
  media_esforco: number
  ultima_sessao: string | null
  sequencia_dias: number
  melhor_sequencia: number
}

export interface SerieHistorico {
  numero_serie: number
  repeticoes: number
  carga: number
}

export interface HistoricoRegistro {
  data: string
  series: SerieHistorico[]
  carga_maxima: number
  volume_sessao: number
}

export interface HistoricoExercicio {
  exercicio: { id: number; nome: string } | null
  periodo: string
  historico: HistoricoRegistro[]
}

// ── Period type ──

export type Period = "7d" | "30d" | "3m" | "6m" | "1y" | "all"

// ── API Functions ──

export function buscarResumoPersonal() {
  return api<{ data: PersonalResumo }>("/dashboard/personal/resumo")
}

export function buscarProgressoAluno(alunoId: number, period: Period = "30d") {
  return api<{ data: ProgressoAluno }>(
    `/dashboard/personal/alunos/${alunoId}/progresso?period=${period}`
  )
}

export function buscarResumoAluno() {
  return api<{ data: AlunoResumo }>("/dashboard/aluno/resumo")
}

export function buscarHistoricoExercicio(exercicioId: number, period: Period = "30d") {
  return api<{ data: HistoricoExercicio }>(
    `/dashboard/aluno/exercicios/${exercicioId}/historico?period=${period}`
  )
}
