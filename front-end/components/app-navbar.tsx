"use client"

import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { Sun, Moon, Dumbbell } from "lucide-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const routeLabels: Record<string, string> = {
  "/dashboard": "Início",
  "/dashboard/alunos": "Meus Alunos",
  "/dashboard/perfil": "Meu Perfil",
  "/dashboard/meu-personal": "Meu Personal",
}

export function AppNavbar() {
  const pathname = usePathname()
  const { resolvedTheme, setTheme } = useTheme()

  const currentLabel = routeLabels[pathname] || "Dashboard"

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 !h-4" />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm">
        <span className="flex items-center gap-1.5 font-bold text-primary">
          <Dumbbell className="size-4" />
          GoGym
        </span>
        <span className="text-muted-foreground">/</span>
        <span className="text-muted-foreground">{currentLabel}</span>
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Theme Toggle */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="h-8 w-8"
          >
            <Sun className="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Alternar tema</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Alternar tema (D)</p>
        </TooltipContent>
      </Tooltip>
    </header>
  )
}
