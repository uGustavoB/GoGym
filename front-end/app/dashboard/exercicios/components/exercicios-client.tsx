"use client"

import { useEffect, useState, useCallback } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  Dumbbell,
  Loader2,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
} from "lucide-react"
import {
  listarExercicios,
  Exercicio,
} from "@/lib/services/treinos"
import { PaginatedResponse } from "@/lib/api"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"

import { ExercicioFormDialog } from "./exercicio-form-dialog"
import { ExercicioDeleteDialog } from "./exercicio-delete-dialog"
import { ExercicioDialogDetails } from "./exercicio-dialog-details"
import { GRUPO_MUSCULAR_MAP, TIPO_MAP } from "@/lib/constants/exercise-constants"


export function ExerciciosClient() {
  const [exercicios, setExercicios] = useState<Exercicio[]>([])
  const [meta, setMeta] = useState<PaginatedResponse<Exercicio>["meta"] | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  
  // Search & Filters (Definitive — sent to server)
  const [search, setSearch] = useState("")
  const [grupoFilter, setGrupoFilter] = useState<string>("todos")
  const [tipoFilter, setTipoFilter] = useState<string>("todos")
  
  // Temporary state for the popover/inputs
  const [tempSearch, setTempSearch] = useState("")
  const [tempGrupoFilter, setTempGrupoFilter] = useState<string>("todos")
  const [tempTipoFilter, setTempTipoFilter] = useState<string>("todos")

  const [activeTab, setActiveTab] = useState("todos")
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Dialogs state
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  
  // Selected exercise for actions
  const [selectedExercicio, setSelectedExercicio] = useState<Exercicio | null>(null)

  const fetchExercicios = useCallback(async () => {
    setLoading(true)
    try {
      // Map tab to is_global param
      const isGlobalParam =
        activeTab === "globais" ? "true" : activeTab === "meus" ? "false" : undefined

      const res = await listarExercicios({
        page,
        nome: search || undefined,
        tipo: tipoFilter !== "todos" ? tipoFilter : undefined,
        grupo_muscular: grupoFilter !== "todos" ? grupoFilter : undefined,
        is_global: isGlobalParam,
      })
      setExercicios(res.data)
      setMeta(res.meta)
    } catch {
      toast.error("Erro ao carregar exercícios.")
    } finally {
      setLoading(false)
    }
  }, [page, search, tipoFilter, grupoFilter, activeTab])

  useEffect(() => {
    fetchExercicios()
  }, [fetchExercicios])

  const handleQuickSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      setPage(1)
      setSearch(tempSearch)
    }
  }

  const applyFilters = () => {
    setPage(1)
    setSearch(tempSearch)
    setGrupoFilter(tempGrupoFilter)
    setTipoFilter(tempTipoFilter)
    setIsFilterOpen(false)
  }

  const clearFilters = () => {
    setTempSearch("")
    setSearch("")
    setTempGrupoFilter("todos")
    setGrupoFilter("todos")
    setTempTipoFilter("todos")
    setTipoFilter("todos")
    setPage(1)
    setIsFilterOpen(false)
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    setPage(1)
  }

  const handleEdit = (ex: Exercicio) => {
    setSelectedExercicio(ex)
    setFormOpen(true)
  }

  const handleDelete = (ex: Exercicio) => {
    setSelectedExercicio(ex)
    setDeleteOpen(true)
  }

  const handleView = (ex: Exercicio) => {
    setSelectedExercicio(ex)
    setDetailsOpen(true)
  }

  const handleCreate = () => {
    setSelectedExercicio(null)
    setFormOpen(true)
  }

  const handleSuccess = () => {
    fetchExercicios()
  }

  const activeFiltersCount = (grupoFilter !== "todos" ? 1 : 0) + (tipoFilter !== "todos" ? 1 : 0) + (search !== "" ? 1 : 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Biblioteca de Exercícios</h1>
          <p className="text-muted-foreground">Gerencie seus exercícios personalizados e explore a biblioteca global.</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 size-4" />
          Novo Exercício
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Dumbbell className="size-4" />
                Lista de Exercícios
              </CardTitle>
              <CardDescription>
                {loading
                  ? "Carregando..."
                  : `${meta?.total ?? 0} exercício${(meta?.total ?? 0) !== 1 ? "s" : ""} encontrado${(meta?.total ?? 0) !== 1 ? "s" : ""}`}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar pelo nome (Enter)..."
                  value={tempSearch}
                  onChange={(e) => setTempSearch(e.target.value)}
                  onKeyDown={handleQuickSearch}
                  className="pl-9"
                />
              </div>
              <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="relative shrink-0">
                    <Filter className="mr-2 size-4" />
                    Filtros
                    {activeFiltersCount > 0 && (
                      <Badge className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full p-0">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Filtros Avançados</h4>
                      <p className="text-sm text-muted-foreground">
                        Refine os exercícios exibidos.
                      </p>
                    </div>
                    <div className="grid gap-3">
                      <div className="grid gap-1.5">
                        <Label>Grupo Muscular</Label>
                        <Select value={tempGrupoFilter} onValueChange={setTempGrupoFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Qualquer grupo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todos">Qualquer grupo</SelectItem>
                            {Object.entries(GRUPO_MUSCULAR_MAP).map(([val, label]) => (
                              <SelectItem key={val} value={val}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-1.5">
                        <Label>Tipo</Label>
                        <Select value={tempTipoFilter} onValueChange={setTempTipoFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Qualquer tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todos">Qualquer tipo</SelectItem>
                            {Object.entries(TIPO_MAP).map(([val, label]) => (
                              <SelectItem key={val} value={val}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 border-t pt-4">
                      <Button variant="ghost" size="sm" onClick={clearFilters}>
                        Limpar
                      </Button>
                      <Button size="sm" onClick={applyFilters}>
                        Aplicar Filtros
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-2">
            <TabsList className="grid w-full grid-cols-3 sm:w-auto">
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="meus">Meus Exercícios</TabsTrigger>
              <TabsTrigger value="globais">Globais</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Grupo Muscular</TableHead>
                  <TableHead className="hidden md:table-cell">Tipo</TableHead>
                  <TableHead>Origem</TableHead>
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
                ) : exercicios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      Nenhum exercício encontrado.
                    </TableCell>
                  </TableRow>
                ) : (
                  <AnimatePresence>
                    {exercicios.map((exercicio) => (
                      <motion.tr
                        key={exercicio.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                      >
                        <TableCell className="font-medium">{exercicio.nome}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-normal">
                            {GRUPO_MUSCULAR_MAP[exercicio.grupo_muscular] || exercicio.grupo_muscular}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="text-muted-foreground">
                            {TIPO_MAP[exercicio.tipo] || exercicio.tipo}
                          </span>
                        </TableCell>
                        <TableCell>
                          {exercicio.is_global ? (
                            <Badge variant="outline" className="text-blue-500 border-blue-200 bg-blue-500/10">Global</Badge>
                          ) : (
                            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-500/10">Seu</Badge>
                          )}
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
                              <DropdownMenuItem onClick={() => handleView(exercicio)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Visualizar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                disabled={exercicio.is_global}
                                onClick={() => handleEdit(exercicio)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                disabled={exercicio.is_global}
                                className="text-destructive focus:bg-destructive focus:text-destructive-foreground"
                                onClick={() => handleDelete(exercicio)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {meta && meta.last_page > 1 && (
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
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
        </CardContent>
      </Card>

      <ExercicioFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        exercicioToEdit={selectedExercicio}
        onSuccess={handleSuccess}
      />

      <ExercicioDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        exercicio={selectedExercicio}
        onSuccess={handleSuccess}
      />

      <ExercicioDialogDetails
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        exercicio={selectedExercicio}
      />
    </div>
  )
}

