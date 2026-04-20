"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
import { redefinirSenhaRequest, type ApiError } from "@/lib/api"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export function RedefinirSenhaForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""
  const emailQuery = searchParams.get("email") || ""

  const [email, setEmail] = useState(emailQuery)
  const [senha, setSenha] = useState("")
  const [senhaConfirmation, setSenhaConfirmation] = useState("")
  
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})

  useEffect(() => {
    if (emailQuery) {
      setEmail(emailQuery)
    }
  }, [emailQuery])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    setIsLoading(true)

    try {
      await redefinirSenhaRequest({
        email,
        token,
        senha,
        senha_confirmation: senhaConfirmation,
      })
      toast.success("Senha redefinida com sucesso!")
      router.push("/auth")
    } catch (err) {
      const apiError = err as ApiError
      if (apiError.errors) {
        setErrors(apiError.errors)
      } else {
        toast.error(apiError.message || "Erro ao redefinir senha.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-destructive">Link Invalido</CardTitle>
            <CardDescription>
              O token de recuperação não foi encontrado na URL.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button type="button" onClick={() => router.push("/esqueci-senha")} className="w-full">
              Solicitar novo link
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Redefinir Senha</CardTitle>
          <CardDescription>
            Crie sua nova senha de acesso.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading || !!emailQuery} 
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email[0]}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="senha">Nova senha</Label>
              <Input
                id="senha"
                type="password"
                placeholder="Mínimo 4 caracteres"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                minLength={4}
                disabled={isLoading}
              />
              {errors.senha && (
                <p className="text-sm text-destructive">{errors.senha[0]}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="senha_confirmation">Confirmar nova senha</Label>
              <Input
                id="senha_confirmation"
                type="password"
                placeholder="Repita a senha"
                value={senhaConfirmation}
                onChange={(e) => setSenhaConfirmation(e.target.value)}
                required
                minLength={4}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Redefinindo...
                </>
              ) : (
                "Redefinir senha"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
