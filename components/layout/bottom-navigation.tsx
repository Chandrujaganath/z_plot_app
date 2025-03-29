"use client"

import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Home, User, Briefcase, Building, FileText, BarChart, LogOut, Settings, Calendar, MessageSquare, Map, Users, QrCode, Receipt, History, ThumbsUp, Search, Eye } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

// Define types for navItems to consistently have label property
type NavItem = {
  href: string;
  icon: React.ReactNode;
  title: string;
  mobileLabel?: string;
  description?: string;
};

interface BottomNavigationProps {
  navItems?: NavItem[];
  showLabels?: boolean;
  customNavItem?: React.ComponentType<{ 
    item: NavItem, 
    isActive: boolean 
  }>;
  navItemClassName?: (isActive: boolean) => string;
}

export default function BottomNavigation({ 
  navItems: propNavItems, 
  showLabels = true, 
  customNavItem: CustomNavItem,
  navItemClassName
}: BottomNavigationProps) {
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
    !pathname ||
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
      // For guest role, ensure the dashboard is included in the navigation
      if (userRole === "guest") {
        // Find the dashboard item
        const dashboardItem = propNavItems.find(item => item.href === "/guest/dashboard") || {
          icon: <Home className="h-5 w-5" />,
          title: "Dashboard",
          mobileLabel: "Home",
          href: "/guest/dashboard"
        };
        
        // Add dashboard and then other important items (up to 4 more)
        const otherItems = propNavItems
          .filter(item => item.href !== "/guest/dashboard")
          .slice(0, 4);
        
        return [dashboardItem, ...otherItems].map(item => ({
          ...item,
          mobileLabel: item.mobileLabel || item.title || item.href.split('/').pop() || "Menu"
        }));
      }
      
      // For client role, ensure the dashboard is included
      if (userRole === "client") {
        // Find the dashboard item
        const dashboardItem = propNavItems.find(item => item.href === "/client/dashboard") || {
          icon: <Home className="h-5 w-5" />,
          title: "Dashboard", 
          mobileLabel: "Home",
          href: "/client/dashboard"
        };
        
        // Add dashboard and then other important items (up to 4 more)
        const otherItems = propNavItems
          .filter(item => item.href !== "/client/dashboard")
          .slice(0, 4);
        
        return [dashboardItem, ...otherItems].map(item => ({
          ...item,
          mobileLabel: item.mobileLabel || item.title || item.href.split('/').pop() || "Menu"
        }));
      }
      
      // For other roles, use provided items but limit to 5 items max
      return propNavItems.slice(0, 5).map(item => ({
        ...item,
        // For consistent interface - if mobileLabel doesn't exist, use title
        mobileLabel: item.mobileLabel || item.title || item.href.split('/').pop() || "Menu"
      }));
    }

    // Fallback navigation items per role
    // These items all have explicit label properties
    switch (userRole) {
      case "guest":
        return [
          { icon: <Home className="h-5 w-5" />, title: "Dashboard", mobileLabel: "Home", href: "/guest/dashboard" },
          { icon: <Building className="h-5 w-5" />, title: "Explore", mobileLabel: "Explore", href: "/guest/explore" },
          { icon: <Calendar className="h-5 w-5" />, title: "Book Visit", mobileLabel: "Book", href: "/guest/book-visit" },
          { icon: <QrCode className="h-5 w-5" />, title: "QR Code", mobileLabel: "QR", href: "/guest/qr-viewer" },
          { icon: <Map className="h-5 w-5" />, title: "Site Map", mobileLabel: "Map", href: "/guest/site-map" },
        ]
      // Other roles remain unchanged but need to be adapted to the new NavItem format
      case "client":
        return [
          { icon: <Home className="h-5 w-5" />, title: "Dashboard", mobileLabel: "Home", href: "/client/dashboard" },
          { icon: <Building className="h-5 w-5" />, title: "My Plots", mobileLabel: "Plots", href: "/client/plots" },
          { icon: <History className="h-5 w-5" />, title: "Visit History", mobileLabel: "Visits", href: "/client/visit-history" },
          { icon: <FileText className="h-5 w-5" />, title: "Documents", mobileLabel: "Docs", href: "/client/documents" },
          { icon: <QrCode className="h-5 w-5" />, title: "Generate QR", mobileLabel: "QR", href: "/client/generate-qr" },
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
              {CustomNavItem ? (
                <CustomNavItem item={item} isActive={isActive} />
              ) : (
                <div
                  className={cn(
                    "flex flex-col items-center justify-center h-full",
                    navItemClassName ? navItemClassName(isActive) : 
                    isActive ? "text-blue-600" : "text-muted-foreground"
                  )}
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
              )}
            </Link>
          )
        })}
      </div>
    </motion.div>
  )
}

