"use client"

import type { ReactNode } from "react"
import { LayoutDashboard, Users, Bell, Globe, BarChart, LogOut } from "lucide-react"
import { useRouter } from "next/navigation"
import ProtectedRoute from "@/components/protected-route"
import AppShell from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

const navItems = [
  {
    title: "Dashboard",
    href: "/super-admin/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: "Admin Management",
    href: "/super-admin/admin-management",
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: "Global Announcements",
    href: "/super-admin/announcements",
    icon: <Bell className="h-5 w-5" />,
  },
  {
    title: "Global Configuration",
    href: "/super-admin/global-config",
    icon: <Globe className="h-5 w-5" />,
  },
  {
    title: "Analytics",
    href: "/super-admin/analytics",
    icon: <BarChart className="h-5 w-5" />,
  },
]

export default function SuperAdminLayout({ children }: { children: ReactNode }) {
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
    <ProtectedRoute requiredRoles={["superadmin"]}>
      <AppShell navItems={navItems} title="Super Admin Portal" headerActions={headerActions}>
        {children}
      </AppShell>
    </ProtectedRoute>
  )
}

