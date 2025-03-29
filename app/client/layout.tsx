"use client"

import type { ReactNode } from "react"
import { LayoutDashboard, Home, QrCode, Video, FileText, Calendar, MessageSquare, LogOut, History, User, Receipt, ChevronRight } from "lucide-react"
import { useRouter, usePathname } from "next/navigation"
import ProtectedRoute from "@/components/protected-route"
import AppShell from "@/components/layout/app-shell"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { motion } from "framer-motion"

const navItems = [
  {
    title: "Dashboard",
    href: "/client/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    mobileLabel: "Home",
    description: "Overview of your plots and activities"
  },
  {
    title: "Owned Plots",
    href: "/client/plots",
    icon: <Home className="h-5 w-5" />,
    mobileLabel: "Plots",
    description: "View and manage your purchased plots"
  },
  {
    title: "Generate Visitor QR",
    href: "/client/generate-qr",
    icon: <QrCode className="h-5 w-5" />,
    mobileLabel: "QR",
    description: "Create QR codes for visitors"
  },
  {
    title: "Visit History",
    href: "/client/visit-history",
    icon: <History className="h-5 w-5" />,
    mobileLabel: "Visits",
    description: "Track your site visits"
  },
  {
    title: "Documents",
    href: "/client/documents",
    icon: <FileText className="h-5 w-5" />,
    mobileLabel: "Docs",
    description: "Access your property documents"
  },
  {
    title: "Payments",
    href: "/client/payments",
    icon: <Receipt className="h-5 w-5" />,
    mobileLabel: "Pay",
    description: "View and manage payments"
  },
  {
    title: "Live CCTV Access",
    href: "/client/cctv",
    icon: <Video className="h-5 w-5" />,
    mobileLabel: "CCTV",
    description: "Access live security footage"
  },
  {
    title: "Book Visit",
    href: "/client/book-visit",
    icon: <Calendar className="h-5 w-5" />,
    mobileLabel: "Book",
    description: "Schedule a site visit"
  },
  {
    title: "Feedback",
    href: "/client/feedback",
    icon: <MessageSquare className="h-5 w-5" />,
    mobileLabel: "Feedback",
    description: "Share your experience"
  },
  {
    title: "Profile",
    href: "/client/profile",
    icon: <User className="h-5 w-5" />,
    mobileLabel: "Profile",
    description: "Manage your account"
  },
]

export default function ClientLayout({ children }: { children: ReactNode }) {
  const { logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  const headerActions = (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50/80 rounded-full transition-colors duration-200"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Logout</span>
      </Button>
    </motion.div>
  )

  // Get current page title for mobile header
  const currentPage = navItems.find(item => pathname === item.href)
  const pageTitle = currentPage?.title || "Client Portal"

  // Custom mobile navigation component
  const MobileNavItem = ({ item, isActive }: { item: typeof navItems[0], isActive: boolean }) => (
    <motion.div
      whileTap={{ scale: 0.95 }}
      className={`relative flex flex-col items-center justify-center ${isActive ? 'text-blue-600' : 'text-muted-foreground'}`}
    >
      {isActive && (
        <motion.div
          layoutId="activeNavIndicator"
          className="absolute -top-1.5 w-1.5 h-1.5 rounded-full bg-blue-600"
          transition={{ type: "spring", duration: 0.5 }}
        />
      )}
      <div className="relative">
        {item.icon}
      </div>
      <span className="text-[10px] mt-1">{item.mobileLabel}</span>
    </motion.div>
  );

  return (
    <ProtectedRoute requiredRoles={["client"]}>
      <AppShell 
        navItems={navItems} 
        title="Client Portal" 
        headerActions={headerActions}
        mobileTitle={pageTitle}
        showMobileNavLabels={true}
        mobileStickyHeader={true}
        maxWidthClass="max-w-5xl"
        customMobileNavItem={MobileNavItem}
        sidebarClassName="bg-white border-r border-slate-100"
        logoClassName="text-blue-600"
        navItemClassName={(isActive) => 
          `flex items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
            isActive 
              ? 'bg-blue-50 text-blue-600' 
              : 'text-muted-foreground hover:bg-slate-50 hover:text-foreground'
          }`
        }
      >
        <div className="px-4 py-4 md:px-6 md:py-8 pb-20 md:pb-8">
          {children}
        </div>
      </AppShell>
    </ProtectedRoute>
  )
}

