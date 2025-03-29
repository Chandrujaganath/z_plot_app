"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { RefreshCw } from "lucide-react"

interface PullToRefreshProps {
  onRefresh: () => Promise<void>
  children: React.ReactNode
}

export default function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [isPulling, setIsPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const startY = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const threshold = 80 // Minimum pull distance to trigger refresh

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleTouchStart = (e: TouchEvent) => {
      // Only enable pull-to-refresh when at the top of the page
      if (window.scrollY <= 0) {
        startY.current = e.touches[0].clientY
        setIsPulling(true)
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling) return

      const currentY = e.touches[0].clientY
      const distance = currentY - startY.current

      // Only allow pulling down
      if (distance > 0 && window.scrollY <= 0) {
        // Apply resistance to make it harder to pull
        const newDistance = Math.min(distance * 0.4, threshold * 1.5)
        setPullDistance(newDistance)

        // Prevent default scrolling behavior when pulling
        e.preventDefault()
      }
    }

    const handleTouchEnd = async () => {
      if (!isPulling) return

      if (pullDistance >= threshold) {
        setIsRefreshing(true)
        try {
          await onRefresh()
        } catch (error) {
          console.error("Refresh failed:", error)
        } finally {
          setIsRefreshing(false)
        }
      }

      setPullDistance(0)
      setIsPulling(false)
    }

    container.addEventListener("touchstart", handleTouchStart, { passive: true })
    container.addEventListener("touchmove", handleTouchMove, { passive: false })
    container.addEventListener("touchend", handleTouchEnd)

    return () => {
      container.removeEventListener("touchstart", handleTouchStart)
      container.removeEventListener("touchmove", handleTouchMove)
      container.removeEventListener("touchend", handleTouchEnd)
    }
  }, [isPulling, pullDistance, onRefresh, threshold])

  return (
    <div ref={containerRef} className="relative min-h-full">
      {/* Pull indicator */}
      {(pullDistance > 0 || isRefreshing) && (
        <motion.div
          className="absolute left-0 right-0 flex justify-center z-10"
          initial={{ y: -20, opacity: 0 }}
          animate={{
            y: pullDistance > 0 ? pullDistance - 20 : 0,
            opacity: pullDistance / threshold,
          }}
          exit={{ y: -20, opacity: 0 }}
        >
          <motion.div
            className="bg-blue-100 rounded-full p-2"
            animate={{
              rotate: isRefreshing ? 360 : pullDistance >= threshold ? 180 : (pullDistance / threshold) * 180,
            }}
            transition={{
              rotate: isRefreshing
                ? {
                    repeat: Number.POSITIVE_INFINITY,
                    duration: 1,
                    ease: "linear",
                  }
                : {
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                  },
            }}
          >
            <RefreshCw className="h-6 w-6 text-blue-600" />
          </motion.div>
        </motion.div>
      )}

      {/* Content with transform to follow pull */}
      <motion.div
        style={{
          y: pullDistance,
          transition: isPulling ? "none" : "transform 0.2s ease-out",
        }}
      >
        {children}
      </motion.div>
    </div>
  )
}

