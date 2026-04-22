"use client"

import { useAuth } from "@/lib/auth-context"
import { motion } from "framer-motion"
import type { Variants } from "framer-motion"
import {
  Mail,
  Phone,
  Shield,
  Calendar,
  UserX,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const GENERO_LABELS: Record<string, string> = {
  masculino: "Masculino",
  feminino: "Feminino",
  nao_binario: "Não Binário",
  outro: "Outro",
  prefiro_nao_informar: "Prefiro não informar",
}

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

export default function MeuPersonalPage() {
  const { personalVinculado } = useAuth()

  if (!personalVinculado) {
    return (
      <div className="space-y-6">
        <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">Meu Personal</h1>
            <p className="text-muted-foreground">
              Informações do seu personal trainer vinculado.
            </p>
          </div>
        </motion.div>

        <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp}>
          <Card className="max-w-lg">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <UserX className="size-7 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">
                Nenhum personal vinculado
              </h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Você ainda não está vinculado a nenhum personal trainer. Peça ao
                seu treinador para enviar um convite de cadastro.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  const initials = personalVinculado.nome
    ? personalVinculado.nome
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "PT"

  const STATUS_LABELS: Record<string, string> = {
    ativo: "Ativo",
    inativo: "Inativo",
  }

  return (
    <div className="space-y-6">
      <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Meu Personal</h1>
          <p className="text-muted-foreground">
            Informações do seu personal trainer vinculado.
          </p>
        </div>
      </motion.div>

      <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp}>
        <Card className="max-w-lg">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="text-lg">
                  {personalVinculado.nome || "Personal Trainer"}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Personal Trainer
                </p>
              </div>
              {personalVinculado.status_vinculo && (
                <Badge
                  variant={personalVinculado.status_vinculo === "ativo" ? "default" : "secondary"}
                  className={
                    personalVinculado.status_vinculo === "ativo"
                      ? "bg-primary/10 text-primary hover:bg-primary/20"
                      : ""
                  }
                >
                  {STATUS_LABELS[personalVinculado.status_vinculo] || personalVinculado.status_vinculo}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-0 divide-y">
            <InfoRow
              icon={Mail}
              label="E-mail"
              value={personalVinculado.email}
            />
            <InfoRow
              icon={Phone}
              label="Telefone"
              value={personalVinculado.telefone}
            />
            <InfoRow
              icon={Shield}
              label="Gênero"
              value={
                personalVinculado.genero
                  ? GENERO_LABELS[personalVinculado.genero] || personalVinculado.genero
                  : null
              }
            />
            <InfoRow
              icon={Calendar}
              label="Membro desde"
              value={
                personalVinculado.cadastrado_em
                  ? new Date(personalVinculado.cadastrado_em).toLocaleDateString("pt-BR")
                  : null
              }
            />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
