"use client"

import type React from "react"

import Link from "next/link"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface DashboardTileProps {
  title: string
  description?: string
  icon: React.ReactNode
  href: string
  color?: "blue" | "green" | "purple" | "orange" | "red" | "teal"
  className?: string
}

export function DashboardTile({ title, icon, href, color = "blue", className }: DashboardTileProps) {
  const colorVariants = {
    blue: "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 hover:border-blue-300",
    green: "bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:border-green-300",
    purple: "bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100 hover:border-purple-300",
    orange: "bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100 hover:border-orange-300",
    red: "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:border-red-300",
    teal: "bg-teal-50 text-teal-600 border-teal-200 hover:bg-teal-100 hover:border-teal-300",
  }

  return (
    <Link href={href} className="inline-block w-full">
      <motion.div
        whileHover={{ scale: 1.03, y: -3 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "rounded-lg border p-3 sm:p-4 transition-all duration-200", 
          "backdrop-filter backdrop-blur-sm bg-opacity-90",
          "shadow-[0_5px_15px_rgb(0,0,0,0.08)]",
          "hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)]",
          colorVariants[color], 
          className
        )}
      >
        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start sm:space-x-3 space-y-2 sm:space-y-0">
          <div className="rounded-full bg-white p-2 shadow-sm">{icon}</div>
          <h3 className="font-medium text-sm sm:text-base text-center sm:text-left">{title}</h3>
        </div>
      </motion.div>
    </Link>
  )
}

