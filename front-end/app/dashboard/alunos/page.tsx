"use client"

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Users,
  UserX,
  Loader2,
  Mail,
  Phone,
  Copy,
  CheckCheck,
  Link as LinkIcon,
  Search,
} from "lucide-react"
import {
  listarAlunosRequest,
  deletarAlunoRequest,
  gerarConviteRequest,
  type AlunoResource,
  type PaginatedResponse,
} from "@/lib/api"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"

import type { Variants } from "framer-motion"

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
}

export default function AlunosPage() {
  const [alunos, setAlunos] = useState<AlunoResource[]>([])
  const [meta, setMeta] = useState<PaginatedResponse<AlunoResource>["meta"] | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  // Unlink dialog
  const [unlinkTarget, setUnlinkTarget] = useState<AlunoResource | null>(null)
  const [unlinking, setUnlinking] = useState(false)

  // Invite
  const [inviteNome, setInviteNome] = useState("")
  const [inviteEmail, setInviteEmail] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Search
  const [search, setSearch] = useState("")

  const fetchAlunos = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const res = await listarAlunosRequest(p)
      setAlunos(res.data)
      setMeta(res.meta)
    } catch {
      toast.error("Erro ao carregar alunos.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAlunos(page)
  }, [page, fetchAlunos])

  const handleUnlink = async () => {
    if (!unlinkTarget) return
    setUnlinking(true)
    try {
      await deletarAlunoRequest(unlinkTarget.id)
      toast.success(`${unlinkTarget.nome} foi desvinculado com sucesso.`)
      setUnlinkTarget(null)
      fetchAlunos(page)
    } catch {
      toast.error("Erro ao desvincular aluno.")
    } finally {
      setUnlinking(false)
    }
  }

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
      const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
      const link = `${baseUrl}/auth?tipo=aluno&token_convite=${res.convite.token}&email=${encodeURIComponent(res.convite.email)}`
      setInviteLink(link)
      toast.success("Convite gerado com sucesso!")
      setInviteNome("")
      setInviteEmail("")
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Erro ao gerar convite."
      toast.error(message)
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

  const filteredAlunos = search
    ? alunos.filter(
        (a) =>
          a.nome.toLowerCase().includes(search.toLowerCase()) ||
          a.email.toLowerCase().includes(search.toLowerCase())
      )
    : alunos

  return (
    <div className="space-y-6">
      <motion.div initial="hidden" animate="visible" variants={fadeUp}>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Meus Alunos</h1>
          <p className="text-muted-foreground">
            Gerencie seus alunos vinculados e envie novos convites.
          </p>
        </div>
      </motion.div>

      {/* Invite Section */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <LinkIcon className="size-4" />
              Convidar Aluno
            </CardTitle>
            <CardDescription>
              Gere um link de convite para que um aluno se cadastre vinculado a
              você.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {inviteLink ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="min-w-0 flex-1 overflow-hidden rounded-md border bg-muted px-3 py-2 text-sm break-all"
                    title={inviteLink}
                  >
                    {inviteLink}
                  </div>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={handleCopyLink}
                    title="Copiar link"
                  >
                    {copied ? (
                      <CheckCheck className="size-4 text-green-600" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setInviteLink(null)}
                >
                  Gerar Novo Convite
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1 space-y-1.5">
                  <Label htmlFor="invite-nome">Nome do Aluno</Label>
                  <Input
                    id="invite-nome"
                    placeholder="Ex: Carlos Silva"
                    value={inviteNome}
                    onChange={(e) => setInviteNome(e.target.value)}
                    disabled={isGenerating}
                  />
                </div>
                <div className="flex-1 space-y-1.5">
                  <Label htmlFor="invite-email">E-mail do Aluno</Label>
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="Ex: carlos@email.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    disabled={isGenerating}
                  />
                </div>
                <Button
                  onClick={handleGerarConvite}
                  disabled={isGenerating}
                  className="shrink-0"
                >
                  {isGenerating && (
                    <Loader2 className="mr-2 size-4 animate-spin" />
                  )}
                  Gerar Convite
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Student List */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Users className="size-4" />
                  Lista de Alunos
                </CardTitle>
                <CardDescription>
                  {meta
                    ? `${meta.total} aluno${meta.total !== 1 ? "s" : ""} encontrado${meta.total !== 1 ? "s" : ""}`
                    : "Carregando..."}
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar aluno..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-60" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))}
              </div>
            ) : filteredAlunos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Users className="size-7 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">Nenhum aluno encontrado</h3>
                <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                  {search
                    ? "Nenhum resultado para sua busca. Tente outro termo."
                    : "Envie um convite acima para vincular seu primeiro aluno."}
                </p>
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead className="hidden md:table-cell">
                          E-mail
                        </TableHead>
                        <TableHead className="hidden lg:table-cell">
                          Telefone
                        </TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {filteredAlunos.map((aluno) => (
                          <motion.tr
                            key={aluno.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                          >
                            <TableCell className="font-medium">
                              {aluno.nome}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              <span className="flex items-center gap-1.5 text-muted-foreground">
                                <Mail className="size-3.5" />
                                {aluno.email}
                              </span>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              <span className="flex items-center gap-1.5 text-muted-foreground">
                                <Phone className="size-3.5" />
                                {aluno.telefone || "—"}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  aluno.status_vinculo === "ativo"
                                    ? "default"
                                    : "secondary"
                                }
                                className={
                                  aluno.status_vinculo === "ativo"
                                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                                    : ""
                                }
                              >
                                {aluno.status_vinculo === "ativo" ? "Ativo" : "Inativo"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => setUnlinkTarget(aluno)}
                              >
                                <UserX className="mr-1.5 size-3.5" />
                                Desvincular
                              </Button>
                            </TableCell>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {meta && meta.last_page > 1 && (
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Página {meta.current_page} de {meta.last_page}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={meta.current_page <= 1}
                        onClick={() => setPage((p) => p - 1)}
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={meta.current_page >= meta.last_page}
                        onClick={() => setPage((p) => p + 1)}
                      >
                        Próxima
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Unlink Confirmation Dialog */}
      <Dialog
        open={!!unlinkTarget}
        onOpenChange={(open) => !open && setUnlinkTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Desvincular Aluno</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja desvincular{" "}
              <strong>{unlinkTarget?.nome}</strong>? Esta ação irá inativar o
              vínculo do aluno com seu perfil.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUnlinkTarget(null)}
              disabled={unlinking}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleUnlink}
              disabled={unlinking}
            >
              {unlinking && <Loader2 className="mr-2 size-4 animate-spin" />}
              Confirmar Desvinculação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
