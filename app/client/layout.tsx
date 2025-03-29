"use client"

import type { ReactNode } from "react"
import { LayoutDashboard, Home, QrCode, Video, FileText, Calendar, MessageSquare, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import ProtectedRoute from "@/components/protected-route"
import AppShell from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

const navItems = [
  {
    title: "Dashboard",
    href: "/client/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: "Owned Plots",
    href: "/client/plots",
    icon: <Home className="h-5 w-5" />,
  },
  {
    title: "Generate Visitor QR",
    href: "/client/generate-qr",
    icon: <QrCode className="h-5 w-5" />,
  },
  {
    title: "Live CCTV Access",
    href: "/client/cctv",
    icon: <Video className="h-5 w-5" />,
  },
  {
    title: "Sell Plot Request",
    href: "/client/sell-request",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: "Book Visit",
    href: "/client/book-visit",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    title: "Feedback",
    href: "/client/feedback",
    icon: <MessageSquare className="h-5 w-5" />,
  },
]

export default function ClientLayout({ children }: { children: ReactNode }) {
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
    <ProtectedRoute requiredRoles={["client"]}>
      <AppShell navItems={navItems} title="Client Portal" headerActions={headerActions}>
        {children}
      </AppShell>
    </ProtectedRoute>
  )
}

