"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { motion } from "framer-motion"
import {
  User,
  Mail,
  Phone,
  Weight,
  Ruler,
  Calendar,
  Shield,
} from "lucide-react"
import {
  exibirAlunoRequest,
  type AlunoResource,
} from "@/lib/api"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

const GENERO_LABELS: Record<string, string> = {
  masculino: "Masculino",
  feminino: "Feminino",
  nao_binario: "Não Binário",
  outro: "Outro",
  prefiro_nao_informar: "Prefiro não informar",
}

import type { Variants } from "framer-motion"

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: string | null | undefined
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate font-medium">{value || "—"}</p>
      </div>
    </div>
  )
}

export default function PerfilPage() {
  const { user, perfilId } = useAuth()
  const [aluno, setAluno] = useState<AlunoResource | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!perfilId) {
      setLoading(false)
      return
    }
    exibirAlunoRequest(perfilId)
      .then((res) => setAluno(res.data))
      .catch(() => setAluno(null))
      .finally(() => setLoading(false))
  }, [perfilId])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Meu Perfil</h1>
            <p className="text-muted-foreground">
              Suas informações pessoais e dados físicos.
            </p>
          </div>
          {aluno && (
            <Badge
              variant={aluno.status_conta === "Ativo" ? "default" : "secondary"}
              className={
                aluno.status_conta === "Ativo"
                  ? "bg-primary/10 text-primary hover:bg-primary/20"
                  : ""
              }
            >
              {aluno.status_conta}
            </Badge>
          )}
        </div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Personal Info */}
        <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="size-4" />
                Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0 divide-y">
              <InfoRow icon={User} label="Nome" value={aluno?.nome || user?.nome} />
              <InfoRow icon={Mail} label="E-mail" value={aluno?.email || user?.email} />
              <InfoRow icon={Phone} label="Telefone" value={aluno?.telefone} />
              <InfoRow
                icon={Shield}
                label="Gênero"
                value={aluno?.genero ? GENERO_LABELS[aluno.genero] || aluno.genero : null}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Physical Data */}
        <motion.div initial="hidden" animate="visible" custom={2} variants={fadeUp}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Weight className="size-4" />
                Dados Físicos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-0 divide-y">
              <InfoRow
                icon={Weight}
                label="Peso"
                value={
                  aluno?.dados_fisicos?.peso
                    ? `${aluno.dados_fisicos.peso} kg`
                    : null
                }
              />
              <InfoRow
                icon={Ruler}
                label="Altura"
                value={
                  aluno?.dados_fisicos?.altura
                    ? `${aluno.dados_fisicos.altura} m`
                    : null
                }
              />
              <InfoRow
                icon={Calendar}
                label="Data de Nascimento"
                value={
                  aluno?.dados_fisicos?.data_nascimento
                    ? new Date(aluno.dados_fisicos.data_nascimento + "T00:00:00").toLocaleDateString(
                        "pt-BR"
                      )
                    : null
                }
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
