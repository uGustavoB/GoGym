"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, Loader2, Dumbbell, FilterX } from "lucide-react"
import { useDebounce } from "use-debounce"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

import { listarExercicios, type Exercicio } from "@/lib/services/treinos"
import { TIPO_MAP, GRUPO_MUSCULAR_MAP } from "@/lib/constants/exercise-constants"

interface ExercicioPickerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (exercicio: Exercicio) => void
}

export function ExercicioPickerDialog({
  open,
  onOpenChange,
  onSelect,
}: ExercicioPickerDialogProps) {
  const [exercicios, setExercicios] = useState<Exercicio[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)

  // Filters state
  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch] = useDebounce(searchTerm, 500)
  
  const [selectedTipo, setSelectedTipo] = useState<string>("todos")
  const [selectedGrupo, setSelectedGrupo] = useState<string>("todos")
  const [selectedOrigem, setSelectedOrigem] = useState<string>("todos")

  // Pagination state
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)

  const fetchExercicios = useCallback(async () => {
    setLoading(true)
    try {
      const filters: any = {}
      if (debouncedSearch) filters.nome = debouncedSearch
      if (selectedTipo !== "todos") filters.tipo = selectedTipo
      if (selectedGrupo !== "todos") filters.grupo_muscular = selectedGrupo
      if (selectedOrigem === "meus") filters.is_global = false
      if (selectedOrigem === "globais") filters.is_global = true

      const res = await listarExercicios({ page, ...filters })
      setExercicios(res.data)
      setTotal(res.meta.total)
      setLastPage(res.meta.last_page)
    } catch (error) {
      console.error("Erro ao buscar exercícios:", error)
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, selectedTipo, selectedGrupo, selectedOrigem, page])

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, selectedTipo, selectedGrupo, selectedOrigem])

  useEffect(() => {
    if (open) {
      fetchExercicios()
    }
  }, [open, fetchExercicios])

  const handleClearFilters = () => {
    setSearchTerm("")
    setSelectedTipo("todos")
    setSelectedGrupo("todos")
    setSelectedOrigem("todos")
    setPage(1)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl flex flex-col gap-0 p-0 overflow-hidden h-[90vh] sm:h-[85vh]">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-primary" />
            Selecionar Exercício
          </DialogTitle>
          <DialogDescription>
            Busque e selecione um exercício para adicionar à rotina.
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 sm:p-6 flex flex-col gap-4 flex-1 overflow-hidden">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome..."
                className="pl-9 bg-background"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={selectedTipo} onValueChange={setSelectedTipo}>
              <SelectTrigger className="w-full sm:w-[140px] bg-background">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Tipos</SelectItem>
                {Object.entries(TIPO_MAP).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedGrupo} onValueChange={setSelectedGrupo}>
              <SelectTrigger className="w-full sm:w-[160px] bg-background">
                <SelectValue placeholder="Grupo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Grupos</SelectItem>
                {Object.entries(GRUPO_MUSCULAR_MAP).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedOrigem} onValueChange={setSelectedOrigem}>
              <SelectTrigger className="w-full sm:w-[140px] bg-background">
                <SelectValue placeholder="Origem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas Origens</SelectItem>
                <SelectItem value="meus">Meus Exercícios</SelectItem>
                <SelectItem value="globais">Globais</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {total} exercício{total !== 1 && 's'} encontrado{total !== 1 && 's'}
            </p>
            <Button variant="ghost" size="sm" onClick={handleClearFilters} className="h-8">
              <FilterX className="mr-2 h-4 w-4" />
              Limpar Filtros
            </Button>
          </div>

          {/* Table Area */}
          <div className="flex-1 rounded-md border overflow-hidden flex flex-col min-h-0">
            <div className="flex-1 overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                  <TableRow>
                    <TableHead className="min-w-[200px]">Nome</TableHead>
                    <TableHead className="min-w-[120px]">Tipo</TableHead>
                    <TableHead className="min-w-[140px]">Grupo Muscular</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && exercicios.length === 0 ? (
                    Array.from({ length: 5 }).map((_, idx) => (
                      <TableRow key={`skeleton-${idx}`}>
                        <TableCell>
                          <Skeleton className="h-4 w-32 mb-1" />
                          <Skeleton className="h-3 w-16" />
                        </TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : exercicios.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-32 text-center">
                        <Dumbbell className="mx-auto h-8 w-8 text-muted-foreground/50 mb-3" />
                        <p className="text-muted-foreground">Nenhum exercício encontrado com esses filtros.</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    exercicios.map((ex) => (
                      <TableRow key={ex.id}>
                        <TableCell className="font-medium">
                          {ex.nome}
                          {ex.is_global === true && (
                            <Badge variant="outline" className="ml-2 text-[10px] uppercase tracking-wider">Global</Badge>
                          )}
                        </TableCell>
                        <TableCell>{TIPO_MAP[ex.tipo as keyof typeof TIPO_MAP] || ex.tipo}</TableCell>
                        <TableCell>{GRUPO_MUSCULAR_MAP[ex.grupo_muscular as keyof typeof GRUPO_MUSCULAR_MAP] || ex.grupo_muscular}</TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <Button
                            size="sm"
                            onClick={() => {
                              onSelect(ex)
                              onOpenChange(false)
                            }}
                          >
                            Selecionar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination Area */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || loading}
              onClick={() => setPage(p => p - 1)}
            >
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {page} de {lastPage}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= lastPage || loading}
              onClick={() => setPage(p => p + 1)}
            >
              Próxima
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
