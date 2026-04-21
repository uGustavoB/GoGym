"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { verifyEmailRequest } from "@/lib/api"
import { useAuth } from "@/lib/auth-context"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

function VerifyEmailInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { refreshProfile } = useAuth()
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("Verificando seu e-mail...")

  useEffect(() => {
    const id = searchParams.get("id")
    const hash = searchParams.get("hash")
    const expires = searchParams.get("expires")
    const signature = searchParams.get("signature")

    if (!id || !hash || !expires || !signature) {
      setStatus("error")
      setMessage("Link de verificação inválido ou expirado.")
      return
    }

    verifyEmailRequest(id, hash, expires, signature)
      .then((res) => {
        setStatus("success")
        setMessage(res.mensagem || "E-mail verificado com sucesso!")
        refreshProfile() // Refresh token/user to bypass verification screen
      })
      .catch((err) => {
        setStatus("error")
        setMessage(err.message || "Não foi possível verificar seu e-mail.")
      })
  }, [searchParams, refreshProfile])

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              {status === "loading" && <Loader2 className="h-8 w-8 animate-spin text-primary" />}
              {status === "success" && <CheckCircle className="h-8 w-8 text-green-500" />}
              {status === "error" && <XCircle className="h-8 w-8 text-destructive" />}
            </div>
            <CardTitle className="text-2xl">
              {status === "loading" && "Aguarde..."}
              {status === "success" && "E-mail Verificado!"}
              {status === "error" && "Erro na Verificação"}
            </CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {status !== "loading" && (
              <Button onClick={() => router.push("/")} className="w-full">
                Ir para o Início
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function VerifyEmailCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-svh w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <VerifyEmailInner />
    </Suspense>
  )
}
