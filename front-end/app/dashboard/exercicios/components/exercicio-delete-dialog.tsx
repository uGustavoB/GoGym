"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Exercicio, deletarExercicio } from "@/lib/services/treinos"
import { toast } from "sonner"

interface ExercicioDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  exercicio: Exercicio | null
  onSuccess: () => void
}

export function ExercicioDeleteDialog({
  open,
  onOpenChange,
  exercicio,
  onSuccess,
}: ExercicioDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  if (!exercicio) return null

  async function handleDelete() {
    setIsDeleting(true)
    try {
      await deletarExercicio(exercicio!.id)
      toast.success("Exercício excluído com sucesso!")
      onSuccess()
      onOpenChange(false)
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir o exercício.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir Exercício</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir o exercício <strong>{exercicio.nome}</strong>? 
            Essa ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting && <Loader2 className="mr-2 size-4 animate-spin" />}
            Excluir exercício
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
