"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { esqueciSenhaRequest, type ApiError } from "@/lib/api"
import { toast } from "sonner"
import { Loader2, ArrowLeft } from "lucide-react"

export function EsqueciSenhaForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    setIsLoading(true)

    try {
      await esqueciSenhaRequest({ email })
      setIsSuccess(true)
      toast.success("E-mail de recuperação enviado!")
    } catch (err) {
      const apiError = err as ApiError
      if (apiError.errors) {
        setErrors(apiError.errors)
      } else {
        toast.error(apiError.message || "Erro ao solicitar recuperação.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Recuperar Senha</CardTitle>
          <CardDescription>
            {isSuccess 
              ? "Confira sua caixa de entrada para redefinir sua senha."
              : "Digite seu e-mail e enviaremos um link para criar uma nova senha."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <div className="flex flex-col gap-4">
              <Button type="button" onClick={() => router.push("/auth")} className="w-full">
                Voltar para o Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email[0]}</p>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2 h-4 w-4" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar link de recuperação"
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push("/auth")} className="w-full" disabled={isLoading}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
