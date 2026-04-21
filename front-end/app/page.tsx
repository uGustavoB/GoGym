"use client"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
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
import { Loader2, LogOut, User, Mail, Shield, Link as LinkIcon, Copy, CheckCheck } from "lucide-react"
import { gerarConviteRequest } from "@/lib/api"
import { toast } from "sonner"

const PERFIL_LABELS: Record<string, string> = {
  personal: "Personal Trainer",
  aluno: "Aluno",
  incompleto: "Incompleto",
}

export default function HomePage() {
  const { user, tipoPerfil, logout, isLoading } = useAuth()
  const [isGenerating, setIsGenerating] = useState(false)
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  
  const [inviteNome, setInviteNome] = useState("")
  const [inviteEmail, setInviteEmail] = useState("")

  if (isLoading) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) return null

  const handleGerarConvite = async () => {
    if (!inviteNome || !inviteEmail) {
      toast.error("Preencha o nome e o e-mail do aluno.")
      return
    }

    setIsGenerating(true)
    setInviteLink(null)
    setCopied(false)
    try {
      const res = await gerarConviteRequest({ nome: inviteNome, email: inviteEmail })
      // Construct frontend invite link containing token and email so it can be handled by /auth
      const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
      const link = `${baseUrl}/auth?tipo=aluno&token_convite=${res.convite.token}&email=${encodeURIComponent(res.convite.email)}`
      setInviteLink(link)
      toast.success("Convite gerado com sucesso!")
      setInviteNome("")
      setInviteEmail("")
    } catch (err: any) {
      toast.error(err.message || "Erro ao gerar convite.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopyLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      toast.success("Link copiado para a área de transferência!")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 py-10">
      <div className="w-full max-w-lg space-y-4">
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

            {tipoPerfil === "personal" && (
              <div className="mt-4 rounded-lg border p-4 bg-muted/30">
                <h3 className="mb-2 font-medium flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" />
                  Convite de Alunos
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Gere um link para convidar seus alunos a se cadastrarem no aplicativo.
                </p>
                
                <div className="space-y-3 mb-4">
                  <div>
                    <Label htmlFor="nome">Nome do Aluno</Label>
                    <Input 
                      id="nome"
                      placeholder="Ex: Carlos Silva" 
                      value={inviteNome}
                      onChange={(e) => setInviteNome(e.target.value)}
                      disabled={isGenerating}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">E-mail do Aluno</Label>
                    <Input 
                      id="email"
                      type="email"
                      placeholder="Ex: carlos@email.com" 
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      disabled={isGenerating}
                    />
                  </div>
                </div>

                {inviteLink ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 overflow-x-hidden text-ellipsis whitespace-nowrap rounded-md border bg-muted px-3 py-2 text-sm" title={inviteLink}>
                        {inviteLink}
                      </div>
                      <Button variant="secondary" size="icon" onClick={handleCopyLink} title="Copiar link">
                        {copied ? <CheckCheck className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <Button variant="outline" className="w-full" onClick={() => setInviteLink(null)}>
                      Gerar Novo Convite
                    </Button>
                  </div>
                ) : (
                  <Button 
                    onClick={handleGerarConvite} 
                    disabled={isGenerating}
                    className="w-full sm:w-auto mt-2"
                  >
                    {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Gerar Link de Convite
                  </Button>
                )}
              </div>
            )}

            <Button
              variant="outline"
              className="w-full mt-2"
              onClick={logout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
