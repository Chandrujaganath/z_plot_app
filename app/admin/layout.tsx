"use client"

import type { ReactNode } from "react"
import { LayoutDashboard, Users, Calendar, ClipboardList, Bell, FileText, Camera, BarChart, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import ProtectedRoute from "@/components/protected-route"
import AppShell from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

const navItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: "Projects",
    href: "/admin/projects",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: "Visit Requests",
    href: "/admin/visits",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    title: "Managers",
    href: "/admin/managers",
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: "Attendance",
    href: "/admin/attendance",
    icon: <ClipboardList className="h-5 w-5" />,
  },
  {
    title: "Leave Requests",
    href: "/admin/leaves",
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    title: "Announcements",
    href: "/admin/announcements",
    icon: <Bell className="h-5 w-5" />,
  },
  {
    title: "Project Templates",
    href: "/admin/templates",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: "CCTV Monitoring",
    href: "/admin/cctv",
    icon: <Camera className="h-5 w-5" />,
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: <BarChart className="h-5 w-5" />,
  },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
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
    <ProtectedRoute requiredRoles={["admin"]}>
      <AppShell navItems={navItems} title="Admin Portal" headerActions={headerActions}>
        {children}
      </AppShell>
    </ProtectedRoute>
  )
}

