"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { motion } from "framer-motion"
import {
  MoreHorizontal,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Dumbbell,
  Search,
  Loader2,
  ClipboardList,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"

import {
  listarFichasTreino,
  deletarFichaTreino,
  buscarFichaTreino,
  type FichaTreino,
} from "@/lib/services/treinos"
import { listarAlunosRequest, type AlunoResource } from "@/lib/api"
import { FichaDetalheModal } from "@/components/treinos/ficha-detalhe-modal"

export default function TreinosPage() {
  const { tipoPerfil } = useAuth()
  
  const [fichas, setFichas] = useState<FichaTreino[]>([])
  const [alunos, setAlunos] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState("")

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState<FichaTreino | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Visualização de Dialog
  const [fichaDetalheId, setFichaDetalheId] = useState<number | null>(null)
  const [fichaDetalhe, setFichaDetalhe] = useState<FichaTreino | null>(null)
  const [loadingDetalhe, setLoadingDetalhe] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      // Carregar todas das prineiras paginas simplificadamente
      const [fichasRes, alunosRes] = await Promise.all([
        listarFichasTreino(1), // Supondo paginação server side, pegando a primeira pág
        listarAlunosRequest(1, {}) // Supondo que retorne alunos
      ])
      
      setFichas(fichasRes.data)
      
      // Mapear id -> nome
      const alunosMap: Record<number, string> = {}
      alunosRes.data.forEach(a => {
        alunosMap[a.id] = a.nome
      })
      setAlunos(alunosMap)
    } catch {
      toast.error("Erro ao carregar as fichas de treino.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deletarFichaTreino(deleteTarget.id)
      toast.success("Ficha excluída com sucesso.")
      setFichas(fichas.filter(f => f.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch {
      toast.error("Erro ao excluir ficha.")
    } finally {
      setDeleting(false)
    }
  }

  const handleVisualizar = async (id: number) => {
    setFichaDetalheId(id)
    setLoadingDetalhe(true)
    try {
      const res = await buscarFichaTreino(id)
      setFichaDetalhe(res.data)
    } catch {
      toast.error("Erro ao buscar detalhes da ficha")
      setFichaDetalheId(null)
    } finally {
      setLoadingDetalhe(false)
    }
  }

  // Filtragem local simples
  const fichasFiltradas = fichas.filter(f => {
    const nomeAluno = alunos[f.aluno_id] || ""
    const termo = busca.toLowerCase()
    return f.nome.toLowerCase().includes(termo) || nomeAluno.toLowerCase().includes(termo)
  })

  // Acesso restrito
  if (tipoPerfil !== 'personal') {
     return (
       <div className="flex flex-col items-center justify-center py-20 text-center">
         <Dumbbell className="size-12 text-muted-foreground mb-4" />
         <h2 className="text-lg font-medium">Acesso Restrito</h2>
         <p className="text-sm text-muted-foreground mt-1">Apenas Personal Trainers podem gerenciar fichas.</p>
       </div>
     )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fichas de Treino</h1>
          <p className="text-muted-foreground">Gerencie as fichas e periodizações dos seus alunos.</p>
        </div>
        <Link href="/dashboard/treinos/criar">
          <Button>
            <Plus className="mr-2 size-4" />
            Nova Ficha
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <ClipboardList className="size-4" />
                Lista de Fichas
              </CardTitle>
              <CardDescription>
                {loading
                  ? "Carregando..."
                  : `${fichasFiltradas.length} ficha${fichasFiltradas.length !== 1 ? "s" : ""} encontrada${fichasFiltradas.length !== 1 ? "s" : ""}`}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome da ficha ou aluno..."
                  className="pl-9"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ficha / Objetivo</TableHead>
              <TableHead>Aluno</TableHead>
              <TableHead>Início</TableHead>
              <TableHead className="hidden md:table-cell">Vencimento</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : fichasFiltradas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                  Nenhuma ficha encontrada.
                </TableCell>
              </TableRow>
            ) : (
              fichasFiltradas.map((ficha) => (
                <TableRow key={ficha.id}>
                  <TableCell>
                    <div className="font-medium text-foreground">{ficha.nome}</div>
                    <div className="text-xs text-muted-foreground">{ficha.objetivo || "Sem objetivo específico"}</div>
                  </TableCell>
                  <TableCell>
                    {alunos[ficha.aluno_id] || "Aluno Desconhecido"}
                  </TableCell>
                  <TableCell>
                    {format(new Date(ficha.data_inicio + 'T00:00:00'), "dd/MM/yyyy", { locale: ptBR })}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {ficha.data_vencimento
                      ? format(new Date(ficha.data_vencimento + 'T00:00:00'), "dd/MM/yyyy", { locale: ptBR })
                      : "Sem vencimento"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleVisualizar(ficha.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem disabled>
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                          onClick={() => setDeleteTarget(ficha)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      </CardContent>
      </Card>

      {/* Modal de Visualização Rápida */}
      <FichaDetalheModal
        open={!!fichaDetalheId}
        onClose={() => setFichaDetalheId(null)}
        ficha={fichaDetalhe}
        loading={loadingDetalhe}
        alunoNome={fichaDetalhe ? (alunos[fichaDetalhe.aluno_id] || `Aluno #${fichaDetalhe.aluno_id}`) : ""}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Ficha de Treino</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a ficha <strong>{deleteTarget?.nome}</strong>? Esta ação
              fará com que o aluno perca imediatamente o acesso a ela e o histórico vinculado será desassociado.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deleting}>
              {deleting && <Loader2 className="mr-2 size-4 animate-spin" />}
              Confirmar Exclusão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
