"use client"

import type { ReactNode } from "react"
import { Building, Calendar, QrCode, MessageSquare, Map, Bookmark, User, LogOut, Home } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import ProtectedRoute from "@/components/protected-route"
import AppShell from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"

const navItems = [
  {
    title: "Dashboard",
    href: "/guest/dashboard",
    icon: <Home className="h-5 w-5" />,
    mobileLabel: "Home",
  },
  {
    title: "Explore Projects",
    href: "/guest/explore",
    icon: <Building className="h-5 w-5" />,
    mobileLabel: "Explore",
  },
  {
    title: "Book Visit",
    href: "/guest/book-visit",
    icon: <Calendar className="h-5 w-5" />,
    mobileLabel: "Book",
  },
  {
    title: "QR Code",
    href: "/guest/qr-viewer",
    icon: <QrCode className="h-5 w-5" />,
    mobileLabel: "QR Code",
  },
  {
    title: "Site Map",
    href: "/guest/site-map",
    icon: <Map className="h-5 w-5" />,
    mobileLabel: "Map",
  },
  {
    title: "My Bookings",
    href: "/guest/my-bookings",
    icon: <Bookmark className="h-5 w-5" />,
    mobileLabel: "Bookings",
  },
  {
    title: "Feedback",
    href: "/guest/feedback",
    icon: <MessageSquare className="h-5 w-5" />,
    mobileLabel: "Feedback",
  },
  {
    title: "Profile",
    href: "/guest/profile",
    icon: <User className="h-5 w-5" />,
    mobileLabel: "Profile",
  },
]

export default function GuestLayout({ children }: { children: ReactNode }) {
  const { logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  const headerActions = (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full"
    >
      <LogOut className="h-4 w-4" />
      <span className="hidden sm:inline">Logout</span>
    </Button>
  )

  // Get current page title for mobile header
  const currentPage = navItems.find(item => pathname === item.href)
  const pageTitle = currentPage?.title || "Guest Portal"

  return (
    <ProtectedRoute requiredRoles={["guest"]}>
      <AppShell 
        navItems={navItems} 
        title="Guest Portal" 
        headerActions={headerActions}
        mobileTitle={pageTitle}
        showMobileNavLabels={true}
        mobileStickyHeader={true}
        maxWidthClass="max-w-5xl"
      >
        <div className="px-4 py-6 md:px-6 md:py-8">
          {children}
        </div>
      </AppShell>
    </ProtectedRoute>
  )
}

