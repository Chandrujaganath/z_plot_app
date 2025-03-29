"use client"

import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Home, User, Briefcase, Building, FileText, BarChart, LogOut, Settings, Calendar, MessageSquare, Map, Users, QrCode, Receipt, History, ThumbsUp, Search, Eye } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useEffect, useState } from "react"

// Define types for navItems to consistently have label property
type NavItem = {
  href: string;
  icon: React.ReactNode;
  label: string;
};

interface BottomNavigationProps {
  navItems?: NavItem[];
}

export default function BottomNavigation({ navItems: propNavItems }: BottomNavigationProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { userRole, logout } = useAuth()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
    }

    // Set initial value
    checkIfMobile()

    // Add event listener
    window.addEventListener("resize", checkIfMobile)

    // Clean up
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  // Don't show bottom navigation on auth pages or on tablet/desktop
  if (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/unauthorized" ||
    pathname === "/forgot-password" ||
    !isMobile
  ) {
    return null
  }

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  // Define navigation items based on user role
  const getNavItems = (): NavItem[] => {
    if (propNavItems && propNavItems.length) {
      // Use provided items but limit to 4 items max to fit mobile screens
      return propNavItems.slice(0, 4).map(item => ({
        ...item,
        label: item.label || item.href.split('/').pop() || "Menu" // Ensure all items have label property
      }))
    }

    // These items all have explicit label properties
    switch (userRole) {
      case "guest":
        return [
          { icon: <Home className="h-5 w-5" />, label: "Home", href: "/guest/dashboard" },
          { icon: <Search className="h-5 w-5" />, label: "Explore", href: "/guest/explore" },
          { icon: <Calendar className="h-5 w-5" />, label: "Book Visit", href: "/guest/book-visit" },
          { icon: <ThumbsUp className="h-5 w-5" />, label: "Feedback", href: "/guest/feedback" },
        ]
      case "client":
        return [
          { icon: <Home className="h-5 w-5" />, label: "Home", href: "/client/dashboard" },
          { icon: <Building className="h-5 w-5" />, label: "My Plots", href: "/client/plots" },
          { icon: <History className="h-5 w-5" />, label: "Visits", href: "/client/visit-history" },
          { icon: <FileText className="h-5 w-5" />, label: "Documents", href: "/client/documents" },
        ]
      case "manager":
        return [
          { icon: <Home className="h-5 w-5" />, label: "Home", href: "/manager/dashboard" },
          { icon: <Briefcase className="h-5 w-5" />, label: "Tasks", href: "/manager/tasks" },
          { icon: <Calendar className="h-5 w-5" />, label: "Attendance", href: "/manager/attendance" },
          { icon: <Users className="h-5 w-5" />, label: "Reports", href: "/manager/reports" },
        ]
      case "admin":
        return [
          { icon: <Home className="h-5 w-5" />, label: "Home", href: "/admin/dashboard" },
          { icon: <Building className="h-5 w-5" />, label: "Projects", href: "/admin/projects" },
          { icon: <Users className="h-5 w-5" />, label: "Managers", href: "/admin/managers" },
          { icon: <BarChart className="h-5 w-5" />, label: "Analytics", href: "/admin/analytics" },
        ]
      case "superadmin":
        return [
          { icon: <Home className="h-5 w-5" />, label: "Home", href: "/super-admin/dashboard" },
          { icon: <Users className="h-5 w-5" />, label: "Admins", href: "/super-admin/admins" },
          { icon: <Building className="h-5 w-5" />, label: "Projects", href: "/super-admin/projects" },
          { icon: <Settings className="h-5 w-5" />, label: "Settings", href: "/super-admin/settings" },
        ]
      default:
        return []
    }
  }

  const navItems = getNavItems()

  // If no role or no nav items, don't render
  if ((!userRole && !propNavItems) || navItems.length === 0) {
    return null
  }

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

          return (
            <Link key={index} href={item.href} className="w-full">
              <div
                className={`flex flex-col items-center justify-center h-full ${
                  isActive ? "text-blue-600" : "text-muted-foreground"
                }`}
              >
                {item.icon}
                <span className="text-[10px] mt-1">{item.label}</span>
                {isActive && (
                  <motion.div
                    className="absolute bottom-0 w-1/5 h-0.5 bg-blue-600 rounded-t-full"
                    layoutId="bottomNavIndicator"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </motion.div>
  )
}

