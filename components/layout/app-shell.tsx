"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import BottomNavigation from "./bottom-navigation"

interface AppShellProps {
  children: React.ReactNode
  title?: string
  headerActions?: React.ReactNode
  navItems?: Array<{ title: string; href: string; icon: React.ReactNode }>
}

export default function AppShell({ children, navItems }: AppShellProps) {
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Main content with padding for bottom navigation on mobile */}
      <main className="flex-1 w-full overflow-x-hidden pt-2 pb-20 md:pb-6">
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
      <BottomNavigation navItems={navItems} />
    </div>
  )
}

