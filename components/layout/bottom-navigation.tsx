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
  title: string;
  mobileLabel?: string;
};

interface BottomNavigationProps {
  navItems?: NavItem[];
  showLabels?: boolean;
}

export default function BottomNavigation({ navItems: propNavItems, showLabels = true }: BottomNavigationProps) {
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
      // Use provided items but limit to 6 items max to fit mobile screens
      return propNavItems.slice(0, 6).map(item => ({
        ...item,
        // For consistent interface - if mobileLabel doesn't exist, use title
        mobileLabel: item.mobileLabel || item.title || item.href.split('/').pop() || "Menu"
      }))
    }

    // Fallback navigation items per role
    // These items all have explicit label properties
    switch (userRole) {
      case "guest":
        return [
          { icon: <Home className="h-5 w-5" />, title: "Home", mobileLabel: "Home", href: "/guest/dashboard" },
          { icon: <Search className="h-5 w-5" />, title: "Explore", mobileLabel: "Explore", href: "/guest/explore" },
          { icon: <Calendar className="h-5 w-5" />, title: "Book Visit", mobileLabel: "Book", href: "/guest/book-visit" },
          { icon: <QrCode className="h-5 w-5" />, title: "QR Code", mobileLabel: "QR", href: "/guest/qr-viewer" },
          { icon: <User className="h-5 w-5" />, title: "Profile", mobileLabel: "Profile", href: "/guest/profile" },
        ]
      // Other roles remain unchanged but need to be adapted to the new NavItem format
      case "client":
        return [
          { icon: <Home className="h-5 w-5" />, title: "Home", mobileLabel: "Home", href: "/client/dashboard" },
          { icon: <Building className="h-5 w-5" />, title: "My Plots", mobileLabel: "Plots", href: "/client/plots" },
          { icon: <History className="h-5 w-5" />, title: "Visits", mobileLabel: "Visits", href: "/client/visit-history" },
          { icon: <FileText className="h-5 w-5" />, title: "Documents", mobileLabel: "Docs", href: "/client/documents" },
          { icon: <User className="h-5 w-5" />, title: "Profile", mobileLabel: "Profile", href: "/client/profile" },
        ]
      // (Other cases remain the same but match the new format)
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
          const label = item.mobileLabel || item.title || '';

          return (
            <Link key={index} href={item.href} className="w-full">
              <div
                className={`flex flex-col items-center justify-center h-full ${
                  isActive ? "text-blue-600" : "text-muted-foreground"
                }`}
              >
                <div className={`${isActive ? 'scale-110 transition-transform duration-200' : ''}`}>
                  {item.icon}
                </div>
                
                {showLabels && (
                  <span className="text-[10px] mt-1 font-medium">{label}</span>
                )}
                
                {isActive && (
                  <motion.div
                    className="absolute bottom-0 h-0.5 bg-blue-600 rounded-t-full"
                    style={{ width: `${100 / navItems.length}%` }}
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

