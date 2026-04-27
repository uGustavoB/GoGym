import { api, type PaginatedResponse } from "@/lib/api"

// ── Interfaces baseadas no modelo relacional do backend ──

export interface Exercicio {
  id: number
  nome: string
  tipo: "superior" | "inferior" | "core" | "cardio" | "full_body"
  grupo_muscular: string
  video_url: string | null
  instrucoes: string | null
  is_global: boolean
  cadastrado_em: string
}

export interface RotinaExercicio {
  id: number
  ordem: number
  tipo_serie: "aquecimento" | "preparacao" | "trabalho" | "mista"
  series: number
  repeticoes: string | null
  rir: number | null
  carga_sugerida: string | null
  tecnica_avancada: string | null
  descanso_segundos: number | null
  observacoes: string | null
  exercicio: Exercicio | null
}

export interface RotinaSessao {
  id: number
  letra_nome: string
  exercicios: RotinaExercicio[]
}

export interface FichaSemana {
  id: number
  numero_semana: number
  descricao_fase: string
  repeticoes_alvo: string
  rir_alvo: number | null
  intensidade_carga: string | null
}

export interface FichaTreino {
  id: number
  aluno_id: number
  nome: string
  objetivo: string | null
  observacoes_gerais: string | null
  data_inicio: string
  data_vencimento: string | null
  semanas: FichaSemana[]
  rotinas: RotinaSessao[]
  cadastrado_em: string
  atualizado_em: string
}

// ── Payloads de criação ──

export interface CriarExercicioRotinaPayload {
  exercicio_id: number
  ordem: number
  tipo_serie: string
  series: number
  repeticoes?: string
  rir?: number
  carga_sugerida?: string
  tecnica_avancada?: string
  descanso_segundos?: number
  observacoes?: string
}

export interface CriarRotinaPayload {
  letra_nome: string
  exercicios: CriarExercicioRotinaPayload[]
}

export interface CriarSemanaPayload {
  numero_semana: number
  descricao_fase: string
  repeticoes_alvo: string
  rir_alvo?: number
  intensidade_carga?: string
}

export interface CriarFichaPayload {
  aluno_id: number
  nome: string
  objetivo?: string
  observacoes_gerais?: string
  data_inicio: string
  data_vencimento?: string
  semanas: CriarSemanaPayload[]
  rotinas: CriarRotinaPayload[]
}

export interface SerieRealizadaPayload {
  rotina_exercicio_id: number
  numero_serie: number
  repeticoes_realizadas: number
  carga_realizada: string
}

export interface RegistrarSessaoPayload {
  rotina_sessao_id: number
  data_execucao: string
  esforco_percebido: number
  duracao_minutos: number
  observacoes_aluno?: string
  series: SerieRealizadaPayload[]
}

// ── Respostas ──

export interface LogSerie {
  id: number
  rotina_exercicio_id: number
  numero_serie: number
  repeticoes_realizadas: number
  carga_realizada: string
}

export interface LogSessao {
  id: number
  aluno_id: number
  rotina_sessao: {
    id: number
    letra_nome: string
  } | null
  data_execucao: string
  esforco_percebido: number
  duracao_minutos: number
  observacoes_aluno: string | null
  series: LogSerie[]
  registado_em: string
}

// ── Funções de API ──

export function listarExercicios(page: number = 1) {
  return api<PaginatedResponse<Exercicio>>(`/exercicio?page=${page}`)
}

export function criarFicha(data: CriarFichaPayload) {
  return api<{ mensagem: string; data: FichaTreino }>("/ficha-treino", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export function buscarFichaAluno() {
  return api<{ data: FichaTreino }>("/registro-treino/meu-treino")
}

export function registrarExecucaoSessao(data: RegistrarSessaoPayload) {
  return api<{ mensagem: string; data: LogSessao }>("/registro-treino/registrar-sessao", {
    method: "POST",
    body: JSON.stringify(data),
  })
}
