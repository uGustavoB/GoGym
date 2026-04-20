"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth, type ApiError } from "@/lib/auth-context"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

const GENEROS = [
  { value: "masculino", label: "Masculino" },
  { value: "feminino", label: "Feminino" },
  { value: "nao_binario", label: "Não-binário" },
  { value: "outro", label: "Outro" },
  { value: "prefiro_nao_informar", label: "Prefiro não informar" },
]

export function RegisterForm({
  onSwitchMode,
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & { onSwitchMode?: () => void }) {
  const searchParams = useSearchParams()
  const hasInviteToken = !!searchParams?.get("token_convite")
  const defaultTab = searchParams?.get("tipo") === "aluno" ? "aluno" : "personal"

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Criar Conta</CardTitle>
          <CardDescription>
            Escolha o tipo de perfil e preencha seus dados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="personal" disabled={hasInviteToken}>Personal Trainer</TabsTrigger>
              <TabsTrigger value="aluno">Aluno</TabsTrigger>
            </TabsList>
            <TabsContent value="personal">
              <PersonalForm />
            </TabsContent>
            <TabsContent value="aluno">
              <AlunoForm />
            </TabsContent>
          </Tabs>
          <div className="mt-4 text-center text-sm">
            Já possui uma conta?{" "}
            {onSwitchMode ? (
              <button type="button" onClick={onSwitchMode} className="underline underline-offset-4 text-primary">
                Fazer login
              </button>
            ) : (
              <a href="/auth" className="underline underline-offset-4 text-primary">
                Fazer login
              </a>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


function PersonalForm() {
  const { registerPersonal } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    telefone: "",
    genero: "",
  })

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    setIsLoading(true)

    try {
      await registerPersonal(form)
      toast.success("Conta criada com sucesso! Verifique seu e-mail.")
    } catch (err) {
      const apiError = err as ApiError
      if (apiError.errors) {
        setErrors(apiError.errors)
      } else {
        toast.error(apiError.message || "Erro ao criar conta.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
      <div className="grid gap-2">
        <Label htmlFor="personal-nome">Nome completo</Label>
        <Input
          id="personal-nome"
          placeholder="Seu nome"
          value={form.nome}
          onChange={(e) => updateField("nome", e.target.value)}
          required
          disabled={isLoading}
        />
        {errors.nome && <p className="text-sm text-destructive">{errors.nome[0]}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="personal-email">E-mail</Label>
        <Input
          id="personal-email"
          type="email"
          placeholder="seu@email.com"
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
          required
          disabled={isLoading}
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email[0]}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="personal-senha">Senha</Label>
        <Input
          id="personal-senha"
          type="password"
          placeholder="Mínimo 4 caracteres"
          value={form.senha}
          onChange={(e) => updateField("senha", e.target.value)}
          required
          minLength={4}
          disabled={isLoading}
        />
        {errors.senha && <p className="text-sm text-destructive">{errors.senha[0]}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="personal-telefone">Telefone</Label>
        <Input
          id="personal-telefone"
          placeholder="(11) 99999-9999"
          value={form.telefone}
          onChange={(e) => updateField("telefone", e.target.value)}
          required
          disabled={isLoading}
        />
        {errors.telefone && <p className="text-sm text-destructive">{errors.telefone[0]}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="personal-genero">Gênero</Label>
        <Select
          value={form.genero}
          onValueChange={(value) => updateField("genero", value)}
          required
          disabled={isLoading}
        >
          <SelectTrigger id="personal-genero">
            <SelectValue placeholder="Selecione o gênero" />
          </SelectTrigger>
          <SelectContent>
            {GENEROS.map((g) => (
              <SelectItem key={g.value} value={g.value}>
                {g.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.genero && <p className="text-sm text-destructive">{errors.genero[0]}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" />
            Criando conta...
          </>
        ) : (
          "Criar conta como Personal"
        )}
      </Button>
    </form>
  )
}

function AlunoForm() {
  const { registerAluno } = useAuth()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [form, setForm] = useState({
    nome: "",
    email: searchParams?.get("email") || "",
    senha: "",
    telefone: "",
    genero: "",
    data_nascimento: "",
    peso: "",
    altura: "",
    token_convite: searchParams?.get("token_convite") || "",
  })

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    setIsLoading(true)

    try {
      await registerAluno({
        nome: form.nome,
        email: form.email,
        senha: form.senha,
        telefone: form.telefone,
        ...(form.genero && { genero: form.genero }),
        ...(form.data_nascimento && { data_nascimento: form.data_nascimento }),
        ...(form.peso && { peso: parseFloat(form.peso) }),
        ...(form.altura && { altura: parseFloat(form.altura) }),
        ...(form.token_convite && { token_convite: form.token_convite }),
      })
      toast.success("Conta criada com sucesso! Verifique seu e-mail.")
    } catch (err) {
      const apiError = err as ApiError
      if (apiError.errors) {
        setErrors(apiError.errors)
      } else {
        toast.error(apiError.message || "Erro ao criar conta.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
      <div className="grid gap-2">
        <Label htmlFor="aluno-nome">Nome completo</Label>
        <Input
          id="aluno-nome"
          placeholder="Seu nome"
          value={form.nome}
          onChange={(e) => updateField("nome", e.target.value)}
          required
          disabled={isLoading}
        />
        {errors.nome && <p className="text-sm text-destructive">{errors.nome[0]}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="aluno-email">E-mail</Label>
        <Input
          id="aluno-email"
          type="email"
          placeholder="seu@email.com"
          value={form.email}
          onChange={(e) => updateField("email", e.target.value)}
          required
          disabled={isLoading}
        />
        {errors.email && <p className="text-sm text-destructive">{errors.email[0]}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="aluno-senha">Senha</Label>
        <Input
          id="aluno-senha"
          type="password"
          placeholder="Mínimo 4 caracteres"
          value={form.senha}
          onChange={(e) => updateField("senha", e.target.value)}
          required
          minLength={4}
          disabled={isLoading}
        />
        {errors.senha && <p className="text-sm text-destructive">{errors.senha[0]}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="aluno-telefone">Telefone</Label>
        <Input
          id="aluno-telefone"
          placeholder="(11) 99999-9999"
          value={form.telefone}
          onChange={(e) => updateField("telefone", e.target.value)}
          required
          disabled={isLoading}
        />
        {errors.telefone && <p className="text-sm text-destructive">{errors.telefone[0]}</p>}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="aluno-genero">Gênero (opcional)</Label>
        <Select
          value={form.genero}
          onValueChange={(value) => updateField("genero", value)}
          disabled={isLoading}
        >
          <SelectTrigger id="aluno-genero">
            <SelectValue placeholder="Selecione o gênero" />
          </SelectTrigger>
          <SelectContent>
            {GENEROS.map((g) => (
              <SelectItem key={g.value} value={g.value}>
                {g.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.genero && <p className="text-sm text-destructive">{errors.genero[0]}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="aluno-peso">Peso (kg)</Label>
          <Input
            id="aluno-peso"
            type="number"
            step="0.1"
            placeholder="75.5"
            value={form.peso}
            onChange={(e) => updateField("peso", e.target.value)}
            disabled={isLoading}
          />
          {errors.peso && <p className="text-sm text-destructive">{errors.peso[0]}</p>}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="aluno-altura">Altura (m)</Label>
          <Input
            id="aluno-altura"
            type="number"
            step="0.01"
            placeholder="1.75"
            value={form.altura}
            onChange={(e) => updateField("altura", e.target.value)}
            disabled={isLoading}
          />
          {errors.altura && <p className="text-sm text-destructive">{errors.altura[0]}</p>}
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="aluno-nascimento">Data de nascimento (opcional)</Label>
        <Input
          id="aluno-nascimento"
          type="date"
          value={form.data_nascimento}
          onChange={(e) => updateField("data_nascimento", e.target.value)}
          disabled={isLoading}
        />
        {errors.data_nascimento && (
          <p className="text-sm text-destructive">{errors.data_nascimento[0]}</p>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="aluno-convite">Token de convite (opcional)</Label>
        <Input
          id="aluno-convite"
          placeholder="Cole o token do seu personal"
          value={form.token_convite}
          onChange={(e) => updateField("token_convite", e.target.value)}
          disabled={isLoading || !!searchParams?.get("token_convite")}
        />
        {errors.token_convite && (
          <p className="text-sm text-destructive">{errors.token_convite[0]}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" />
            Criando conta...
          </>
        ) : (
          "Criar conta como Aluno"
        )}
      </Button>
    </form>
  )
}
