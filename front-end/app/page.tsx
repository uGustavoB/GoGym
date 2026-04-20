"use client"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Loader2, LogOut, User, Mail, Shield } from "lucide-react"

const PERFIL_LABELS: Record<string, string> = {
  personal: "Personal Trainer",
  aluno: "Aluno",
  incompleto: "Incompleto",
}

export default function HomePage() {
  const { user, tipoPerfil, logout, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-lg">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <User className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">
              Olá, {user.nome.split(" ")[0]}! 👋
            </CardTitle>
            <CardDescription>
              Bem-vindo ao GoGym. Seu login foi realizado com sucesso.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="divide-y rounded-lg border">
              <div className="flex items-center gap-3 p-4">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Nome</p>
                  <p className="font-medium">{user.nome}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">E-mail</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Tipo de perfil</p>
                  <p className="font-medium">
                    {tipoPerfil ? PERFIL_LABELS[tipoPerfil] || tipoPerfil : "—"}
                  </p>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full"
              onClick={logout}
            >
              <LogOut />
              Sair
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
