"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Exercicio } from "@/lib/services/treinos"
import { Dumbbell, Info, Video } from "lucide-react"

interface ExercicioDialogDetailsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  exercicio: Exercicio | null
}

const GRUPO_MUSCULAR_MAP: Record<string, string> = {
  peitoral: "Peitoral",
  costas: "Costas",
  ombros: "Ombros",
  biceps: "Bíceps",
  triceps: "Tríceps",
  quadriceps: "Quadríceps",
  posterior_coxa: "Posterior de Coxa",
  gluteos: "Glúteos",
  panturrilhas: "Panturrilhas",
  abdomen: "Abdômen",
  outro: "Outro",
}

const TIPO_MAP: Record<string, string> = {
  superior: "Membros Superiores",
  inferior: "Membros Inferiores",
  core: "Core",
  cardio: "Cardio",
  full_body: "Full Body",
}

export function ExercicioDialogDetails({
  open,
  onOpenChange,
  exercicio,
}: ExercicioDialogDetailsProps) {
  if (!exercicio) return null

  // Utility to convert youtube url to embed format if needed, 
  // but for a simple display we can just show a link if it's not embeddable.
  const getEmbedUrl = (url: string) => {
    if (url.includes("youtube.com/watch?v=")) {
      return url.replace("watch?v=", "embed/")
    }
    if (url.includes("youtu.be/")) {
      return url.replace("youtu.be/", "youtube.com/embed/")
    }
    return null
  }

  const embedUrl = exercicio.video_url ? getEmbedUrl(exercicio.video_url) : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden">
        <div className="bg-muted/40 p-6 pb-4">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <DialogTitle className="text-2xl flex items-center gap-2">
                  <Dumbbell className="size-5 text-primary" />
                  {exercicio.nome}
                </DialogTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="bg-background">
                    {GRUPO_MUSCULAR_MAP[exercicio.grupo_muscular] || exercicio.grupo_muscular}
                  </Badge>
                  <Badge variant="secondary">
                    {TIPO_MAP[exercicio.tipo] || exercicio.tipo}
                  </Badge>
                  {exercicio.is_global ? (
                    <Badge variant="outline" className="text-blue-500 border-blue-200 bg-blue-500/10">Global</Badge>
                  ) : (
                    <Badge variant="outline" className="text-green-600 border-green-200 bg-green-500/10">Criado por você</Badge>
                  )}
                </div>
              </div>
            </div>
          </DialogHeader>
        </div>

        <Separator />

        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
              <Info className="size-4" />
              Instruções de Execução
            </h4>
            {exercicio.instrucoes ? (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {exercicio.instrucoes}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Nenhuma instrução disponível para este exercício.
              </p>
            )}
          </div>

          {exercicio.video_url && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                <Video className="size-4" />
                Vídeo Demonstrativo
              </h4>
              {embedUrl ? (
                <div className="aspect-video w-full rounded-md overflow-hidden border">
                  <iframe 
                    src={embedUrl} 
                    className="w-full h-full" 
                    allowFullScreen 
                    title={`Vídeo: ${exercicio.nome}`}
                  />
                </div>
              ) : (
                <a 
                  href={exercicio.video_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  Assistir vídeo demonstrativo
                </a>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
