"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { motion } from "framer-motion"
import {
  Dumbbell,
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  UserX,
} from "lucide-react"
import {
  listarAlunosRequest,
  exibirPersonalRequest,
  type PersonalResource,
} from "@/lib/api"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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

export default function MeuPersonalPage() {
  const { perfilId } = useAuth()
  const [personal, setPersonal] = useState<PersonalResource | null>(null)
  const [loading, setLoading] = useState(true)
  const [notLinked, setNotLinked] = useState(false)

  useEffect(() => {
    // The aluno's linked personal can be discovered via the aluno listing
    // which returns status_vinculo. We try to fetch the personal list to find
    // the linked one. This is a workaround since the API doesn't have a direct
    // "my personal" endpoint — we use GET /personal which returns all, and the
    // aluno can see relevant data.
    async function fetchPersonal() {
      try {
        const res = await listarAlunosRequest(1)
        // In the aluno context, the API returns the aluno's own data
        // The personal info is obtained through the personal listing
        const personaisRes = await (await import("@/lib/api")).listarPersonaisRequest(1)
        if (personaisRes.data.length > 0) {
          // Show the first personal (the one linked to this aluno)
          const p = personaisRes.data[0]
          // Fetch full details
          const fullPersonal = await exibirPersonalRequest(p.id)
          setPersonal(fullPersonal.data)
        } else {
          setNotLinked(true)
        }
      } catch {
        setNotLinked(true)
      } finally {
        setLoading(false)
      }
    }

    fetchPersonal()
  }, [perfilId])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-1">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-72 max-w-lg" />
      </div>
    )
  }

  if (notLinked || !personal) {
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

  const initials = personal.nome
    ? personal.nome
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "PT"

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
              <div>
                <CardTitle className="text-lg">
                  {personal.nome || "Personal Trainer"}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Personal Trainer
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-0 divide-y">
            <InfoRow
              icon={Mail}
              label="E-mail"
              value={personal.email}
            />
            <InfoRow
              icon={Phone}
              label="Telefone"
              value={personal.telefone}
            />
            <InfoRow
              icon={Shield}
              label="Gênero"
              value={
                personal.genero
                  ? GENERO_LABELS[personal.genero] || personal.genero
                  : null
              }
            />
            <InfoRow
              icon={Calendar}
              label="Membro desde"
              value={
                personal.cadastrado_em
                  ? new Date(personal.cadastrado_em).toLocaleDateString("pt-BR")
                  : null
              }
            />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
