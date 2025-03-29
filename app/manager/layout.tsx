"use client"

import type { ReactNode } from "react"
import {
  LayoutDashboard,
  CheckSquare,
  Clock,
  Calendar,
  MessageSquare,
  Users,
  Settings,
  QrCode,
  Video,
  LogOut,
} from "lucide-react"
import { useRouter } from "next/navigation"
import ProtectedRoute from "@/components/protected-route"
import AppShell from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

const navItems = [
  {
    title: "Dashboard",
    href: "/manager/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: "Tasks",
    href: "/manager/tasks",
    icon: <CheckSquare className="h-5 w-5" />,
  },
  {
    title: "Attendance",
    href: "/manager/attendance",
    icon: <Clock className="h-5 w-5" />,
  },
  {
    title: "Leave Requests",
    href: "/manager/leave",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    title: "Scan QR",
    href: "/manager/scan-qr",
    icon: <QrCode className="h-5 w-5" />,
  },
  {
    title: "CCTV",
    href: "/manager/cctv",
    icon: <Video className="h-5 w-5" />,
  },
  {
    title: "Feedback",
    href: "/manager/feedback",
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    title: "Team",
    href: "/manager/team",
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: "Settings",
    href: "/manager/settings",
    icon: <Settings className="h-5 w-5" />,
  },
]

export default function ManagerLayout({ children }: { children: ReactNode }) {
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
    <ProtectedRoute requiredRoles={["manager"]}>
      <AppShell navItems={navItems} title="Manager Portal" headerActions={headerActions}>
        {children}
      </AppShell>
    </ProtectedRoute>
  )
}

