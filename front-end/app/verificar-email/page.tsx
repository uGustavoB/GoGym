"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { resendVerificationRequest } from "@/lib/api"
import { toast } from "sonner"
import { Loader2, Mail, RefreshCw, LogOut, CheckCircle } from "lucide-react"

export default function VerifyEmailPage() {
  const { user, refreshProfile, logout, isLoading: authLoading } = useAuth()
  const [isResending, setIsResending] = useState(false)
  const [isChecking, setIsChecking] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  // Countdown timer for cooldown
  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  async function handleResend() {
    setIsResending(true)
    try {
      await resendVerificationRequest()
      toast.success("E-mail de verificação reenviado!")
      setCooldown(60)
    } catch (err: unknown) {
      const error = err as { message?: string }
      toast.error(error.message || "Erro ao reenviar e-mail.")
    } finally {
      setIsResending(false)
    }
  }

  async function handleCheckVerification() {
    setIsChecking(true)
    try {
      await refreshProfile()
      // The AuthContext route protection will redirect to "/" if verified
    } catch {
      toast.error("Erro ao verificar status.")
    } finally {
      setIsChecking(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Verifique seu e-mail</CardTitle>
            <CardDescription>
              Enviamos um link de verificação para o endereço abaixo.
              Clique no link do e-mail para ativar sua conta.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {user && (
              <div className="rounded-lg bg-muted p-3 text-center">
                <p className="text-sm text-muted-foreground">Enviado para</p>
                <p className="font-medium">{user.email}</p>
              </div>
            )}

            <Button
              onClick={handleResend}
              variant="outline"
              className="w-full"
              disabled={isResending || cooldown > 0}
            >
              {isResending ? (
                <>
                  <Loader2 className="animate-spin" />
                  Reenviando...
                </>
              ) : cooldown > 0 ? (
                <>
                  <RefreshCw />
                  Reenviar em {cooldown}s
                </>
              ) : (
                <>
                  <RefreshCw />
                  Reenviar e-mail de verificação
                </>
              )}
            </Button>

            <Button
              onClick={handleCheckVerification}
              className="w-full"
              disabled={isChecking}
            >
              {isChecking ? (
                <>
                  <Loader2 className="animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <CheckCircle />
                  Já verifiquei meu e-mail
                </>
              )}
            </Button>

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">ou</span>
              </div>
            </div>

            <Button
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={logout}
            >
              <LogOut />
              Sair e usar outra conta
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
