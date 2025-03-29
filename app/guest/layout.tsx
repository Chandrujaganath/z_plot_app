"use client"

import type { ReactNode } from "react"
import { Building, Calendar, QrCode, MessageSquare, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import ProtectedRoute from "@/components/protected-route"
import AppShell from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

const navItems = [
  {
    title: "Explore Projects",
    href: "/guest/explore",
    icon: <Building className="h-5 w-5" />,
  },
  {
    title: "Book Visit",
    href: "/guest/book-visit",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    title: "QR Code Viewer",
    href: "/guest/qr-viewer",
    icon: <QrCode className="h-5 w-5" />,
  },
  {
    title: "Feedback",
    href: "/guest/feedback",
    icon: <MessageSquare className="h-5 w-5" />,
  },
]

export default function GuestLayout({ children }: { children: ReactNode }) {
  const { logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  const headerActions = (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
    >
      <LogOut className="h-4 w-4" />
      <span className="hidden sm:inline">Logout</span>
    </Button>
  )

  return (
    <ProtectedRoute requiredRoles={["guest"]}>
      <AppShell navItems={navItems} title="Guest Portal" headerActions={headerActions}>
        {children}
      </AppShell>
    </ProtectedRoute>
  )
}

