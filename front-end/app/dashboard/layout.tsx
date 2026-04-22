"use client"

import { useAuth } from "@/lib/auth-context"
import { Loader2 } from "lucide-react"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { AppNavbar } from "@/components/app-navbar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isLoading, user } = useAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) return null

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <AppNavbar />
        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
