const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8008/api";

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}

function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("gogym_token")
}

export function setToken(token: string) {
  localStorage.setItem("gogym_token", token)
}

export function clearToken() {
  localStorage.removeItem("gogym_token")
}

export async function api<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: "Erro de conexão com o servidor.",
    }))

    const error: ApiError = {
      message: errorData.message || errorData.mensagem || "Erro desconhecido.",
      errors: errorData.errors,
    }

    throw error
  }

  return response.json() as Promise<T>
}

// ── Auth endpoints ──

export interface LoginResponse {
  usuario: {
    id: number
    nome: string
    email: string
    data_verificacao_email: string | null
    created_at: string
    updated_at: string
  }
  token: string
}

export interface RegisterResponse {
  mensagem: string
  dados: Record<string, unknown>
  token: string
}

export interface ProfileResponse {
  usuario: {
    id: number
    nome: string
    email: string
    email_verificado: boolean
  }
  tipo_perfil: "personal" | "aluno" | "incompleto"
  perfil_id: number | null
}

export interface MessageResponse {
  mensagem: string
}

export function loginRequest(email: string, senha: string) {
  return api<LoginResponse>("/login", {
    method: "POST",
    body: JSON.stringify({ email, senha }),
  })
}

export interface RegisterPersonalData {
  nome: string
  email: string
  senha: string
  telefone: string
  genero: string
}

export function registerPersonalRequest(data: RegisterPersonalData) {
  return api<RegisterResponse>("/registrar/personal", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export interface RegisterAlunoData {
  nome: string
  email: string
  senha: string
  telefone: string
  genero?: string
  data_nascimento?: string
  peso?: number
  altura?: number
  token_convite?: string
}

export function registerAlunoRequest(data: RegisterAlunoData) {
  return api<RegisterResponse>("/registrar/aluno", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export function getProfileRequest() {
  return api<ProfileResponse>("/perfil")
}

export function logoutRequest() {
  return api<MessageResponse>("/sair", { method: "POST" })
}

export function resendVerificationRequest() {
  return api<MessageResponse>("/email/reenviar", { method: "POST" })
}

export interface EsqueciSenhaData {
  email: string
}

export function esqueciSenhaRequest(data: EsqueciSenhaData) {
  return api<MessageResponse>("/esqueci-senha", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export interface RedefinirSenhaData {
  email: string
  token: string
  senha: string
  senha_confirmation: string
}

export function redefinirSenhaRequest(data: RedefinirSenhaData) {
  return api<MessageResponse>("/redefinir-senha", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export function verifyEmailRequest(id: string, hash: string, expires: string, signature: string) {
  return api<MessageResponse>(`/email/verificar/${id}/${hash}?expires=${expires}&signature=${signature}`, {
    method: "GET",
  })
}

export interface ConviteResponse {
  mensagem: string;
  convite: {
    email: string;
    token: string;
    status: string;
  };
}

export function gerarConviteRequest(data: { nome: string, email: string }) {
  return api<ConviteResponse>("/personal/gerar-convite", {
    method: "POST",
    body: JSON.stringify(data),
  })
}


