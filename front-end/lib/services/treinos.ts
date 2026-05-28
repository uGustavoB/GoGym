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

export interface CriarExercicioPayload {
  nome: string
  tipo: "superior" | "inferior" | "core" | "cardio" | "full_body"
  grupo_muscular: string
  video_url?: string
  instrucoes?: string
}

export interface AtualizarExercicioPayload extends Partial<CriarExercicioPayload> {}

export interface RotinaExercicio {
  id: number
  exercicio_id: number
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

export interface ExercicioFiltros {
  page?: number
  nome?: string
  tipo?: string
  grupo_muscular?: string
  is_global?: string // "true" | "false"
}

export function listarExercicios(filtros: ExercicioFiltros = {}) {
  const params = new URLSearchParams()
  params.set("page", String(filtros.page ?? 1))

  if (filtros.nome) params.set("nome", filtros.nome)
  if (filtros.tipo) params.set("tipo", filtros.tipo)
  if (filtros.grupo_muscular) params.set("grupo_muscular", filtros.grupo_muscular)
  if (filtros.is_global !== undefined) params.set("is_global", String(filtros.is_global))

  return api<PaginatedResponse<Exercicio>>(`/exercicio?${params.toString()}`)
}

export function criarExercicio(data: CriarExercicioPayload) {
  return api<{ mensagem: string; data: Exercicio }>("/exercicio", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export function atualizarExercicio(id: number, data: AtualizarExercicioPayload) {
  return api<{ mensagem: string; data: Exercicio }>(`/exercicio/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export function deletarExercicio(id: number) {
  return api<{ mensagem: string }>(`/exercicio/${id}`, {
    method: "DELETE",
  })
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

export function listarFichasTreino(page: number = 1) {
  return api<PaginatedResponse<FichaTreino>>(`/ficha-treino?page=${page}`)
}

export function buscarFichaTreino(id: number) {
  return api<{ data: FichaTreino }>(`/ficha-treino/${id}`)
}

export function deletarFichaTreino(id: number) {
  return api<{ mensagem: string }>(`/ficha-treino/${id}`, {
    method: "DELETE",
  })
}

// ── Payloads de atualização (estendem criação com IDs opcionais) ──

export interface AtualizarExercicioRotinaPayload extends CriarExercicioRotinaPayload {
  id?: number
}

export interface AtualizarRotinaPayload {
  id?: number
  letra_nome: string
  exercicios: AtualizarExercicioRotinaPayload[]
}

export interface AtualizarSemanaPayload extends CriarSemanaPayload {
  id?: number
}

export interface AtualizarFichaPayload {
  aluno_id: number
  nome: string
  objetivo?: string
  observacoes_gerais?: string
  data_inicio: string
  data_vencimento?: string
  semanas: AtualizarSemanaPayload[]
  rotinas: AtualizarRotinaPayload[]
}

export function atualizarFicha(id: number, data: AtualizarFichaPayload) {
  return api<{ mensagem: string; data: FichaTreino }>(`/ficha-treino/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}
