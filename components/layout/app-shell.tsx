"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import BottomNavigation from "./bottom-navigation"
import { cn } from "@/lib/utils"

interface AppShellProps {
  children: React.ReactNode
  title?: string
  mobileTitle?: string
  headerActions?: React.ReactNode
  navItems?: Array<{ 
    title: string
    href: string
    icon: React.ReactNode
    mobileLabel?: string 
  }>
  showMobileNavLabels?: boolean
  mobileStickyHeader?: boolean
  maxWidthClass?: string
}

export default function AppShell({ 
  children, 
  navItems, 
  title,
  mobileTitle,
  headerActions,
  showMobileNavLabels = false,
  mobileStickyHeader = false,
  maxWidthClass = "max-w-7xl"
}: AppShellProps) {
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    // Add scroll listener for sticky header
    if (mobileStickyHeader) {
      const handleScroll = () => {
        setScrolled(window.scrollY > 10)
      }
      window.addEventListener('scroll', handleScroll)
      return () => window.removeEventListener('scroll', handleScroll)
    }
  }, [mobileStickyHeader])

  if (!isMounted) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Mobile Header */}
      {mobileStickyHeader && (
        <header 
          className={cn(
            "fixed top-0 left-0 w-full z-50 px-4 py-3 flex items-center justify-between md:hidden transition-all duration-300",
            scrolled 
              ? "bg-white/95 backdrop-blur-sm shadow-sm" 
              : "bg-transparent"
          )}
        >
          <h1 className="text-lg font-semibold truncate">{mobileTitle || title}</h1>
          {headerActions && (
            <div className="flex items-center space-x-2">
              {headerActions}
            </div>
          )}
        </header>
      )}

      {/* Main content with padding for bottom navigation on mobile */}
      <main className={cn(
        "flex-1 w-full overflow-x-hidden",
        mobileStickyHeader ? "mt-14 md:mt-0" : "",
        "pb-20 md:pb-6 mx-auto",
        maxWidthClass
      )}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          {children}
        </motion.div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation 
        navItems={navItems} 
        showLabels={showMobileNavLabels} 
      />
    </div>
  )
}

