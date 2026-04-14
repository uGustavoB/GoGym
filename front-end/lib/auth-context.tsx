"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  loginRequest,
  registerPersonalRequest,
  registerAlunoRequest,
  getProfileRequest,
  logoutRequest,
  setToken,
  clearToken,
  type ProfileResponse,
  type RegisterPersonalData,
  type RegisterAlunoData,
  type ApiError,
} from "@/lib/api"

interface User {
  id: number
  nome: string
  email: string
  email_verificado: boolean
}

interface AuthState {
  user: User | null
  token: string | null
  tipoPerfil: string | null
  perfilId: number | null
  isLoading: boolean
}

interface AuthContextType extends AuthState {
  login: (email: string, senha: string) => Promise<void>
  registerPersonal: (data: RegisterPersonalData) => Promise<void>
  registerAluno: (data: RegisterAlunoData) => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

const PUBLIC_ROUTES = ["/login", "/registrar"]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    tipoPerfil: null,
    perfilId: null,
    isLoading: true,
  })

  const refreshProfile = useCallback(async () => {
    try {
      const profile: ProfileResponse = await getProfileRequest()
      setState((prev) => ({
        ...prev,
        user: profile.usuario,
        tipoPerfil: profile.tipo_perfil,
        perfilId: profile.perfil_id,
        isLoading: false,
      }))
    } catch {
      clearToken()
      setState({
        user: null,
        token: null,
        tipoPerfil: null,
        perfilId: null,
        isLoading: false,
      })
    }
  }, [])

  // On mount: check if there's a stored token and load profile
  useEffect(() => {
    const storedToken = typeof window !== "undefined" ? localStorage.getItem("gogym_token") : null
    if (storedToken) {
      setState((prev) => ({ ...prev, token: storedToken }))
      refreshProfile()
    } else {
      setState((prev) => ({ ...prev, isLoading: false }))
    }
  }, [refreshProfile])

  // Route protection
  useEffect(() => {
    if (state.isLoading) return

    const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route))

    if (!state.token && !isPublicRoute) {
      router.replace("/login")
      return
    }

    if (state.token && state.user) {
      if (!state.user.email_verificado && pathname !== "/verificar-email") {
        if (!isPublicRoute) {
          router.replace("/verificar-email")
        }
        return
      }

      if (state.user.email_verificado && (isPublicRoute || pathname === "/verificar-email")) {
        router.replace("/")
        return
      }
    }
  }, [state.isLoading, state.token, state.user, pathname, router])

  const login = async (email: string, senha: string) => {
    const response = await loginRequest(email, senha)
    setToken(response.token)
    setState((prev) => ({ ...prev, token: response.token }))

    const profile = await getProfileRequest()
    setState((prev) => ({
      ...prev,
      user: profile.usuario,
      tipoPerfil: profile.tipo_perfil,
      perfilId: profile.perfil_id,
    }))

    if (profile.usuario.email_verificado) {
      router.replace("/")
    } else {
      router.replace("/verificar-email")
    }
  }

  const registerPersonal = async (data: RegisterPersonalData) => {
    const response = await registerPersonalRequest(data)
    setToken(response.token)
    setState((prev) => ({ ...prev, token: response.token }))

    const profile = await getProfileRequest()
    setState((prev) => ({
      ...prev,
      user: profile.usuario,
      tipoPerfil: profile.tipo_perfil,
      perfilId: profile.perfil_id,
    }))

    router.replace("/verificar-email")
  }

  const registerAluno = async (data: RegisterAlunoData) => {
    const response = await registerAlunoRequest(data)
    setToken(response.token)
    setState((prev) => ({ ...prev, token: response.token }))

    const profile = await getProfileRequest()
    setState((prev) => ({
      ...prev,
      user: profile.usuario,
      tipoPerfil: profile.tipo_perfil,
      perfilId: profile.perfil_id,
    }))

    router.replace("/verificar-email")
  }

  const logout = async () => {
    try {
      await logoutRequest()
    } catch {
      // Even if logout fails on server, clear locally
    }
    clearToken()
    setState({
      user: null,
      token: null,
      tipoPerfil: null,
      perfilId: null,
      isLoading: false,
    })
    router.replace("/login")
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        registerPersonal,
        registerAluno,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export type { ApiError }
