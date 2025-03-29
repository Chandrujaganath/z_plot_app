"use client"

import { useMemo, useState, useEffect } from "react"
import { motion } from "framer-motion"
import type { Plot } from "@/lib/models"

interface ClientPlotGridProps {
  plots: Plot[]
  onPlotClick: (plot: Plot) => void
  selectedPlotId?: string
  clientId: string
}

export default function ClientPlotGrid({ plots, onPlotClick, selectedPlotId, clientId }: ClientPlotGridProps) {
  const [scale, setScale] = useState(1)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 640
      setIsMobile(mobile)
      // Set smaller initial scale on mobile
      if (mobile && scale === 1) {
        setScale(0.8)
      }
    }

    // Set initial value
    checkIfMobile()

    // Add event listener
    window.addEventListener("resize", checkIfMobile)

    // Clean up
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [scale])

  // Find the maximum row and column to determine grid size
  const { maxRow, maxCol } = useMemo(() => {
    let maxRow = 0
    let maxCol = 0

    plots.forEach((plot) => {
      maxRow = Math.max(maxRow, plot.row)
      maxCol = Math.max(maxCol, plot.col)
    })

    return { maxRow, maxCol }
  }, [plots])

  // Create a 2D grid representation
  const grid = useMemo(() => {
    const gridArray: (Plot | null)[][] = Array(maxRow + 1)
      .fill(null)
      .map(() => Array(maxCol + 1).fill(null))

    plots.forEach((plot) => {
      gridArray[plot.row][plot.col] = plot
    })

    return gridArray
  }, [plots, maxRow, maxCol])

  // Get background color based on plot type and status
  const getPlotColor = (plot: Plot | null) => {
    if (!plot) return "bg-white"

    if (plot.type === "road") return "bg-gray-800"
    if (plot.type === "amenity") return "bg-blue-500"

    // Highlight plots owned by the client
    if (plot.ownerId === clientId) return "bg-blue-600"

    switch (plot.status) {
      case "available":
        return "bg-green-500"
      case "sold":
        return "bg-gray-400"
      case "reserved":
        return "bg-yellow-500"
      default:
        return "bg-white"
    }
  }

  // Get cursor style based on plot type and status
  const getPlotCursor = (plot: Plot | null) => {
    if (!plot) return ""
    if (plot.type !== "plot") return ""

    // All plots are clickable in client view
    return "cursor-pointer"
  }

  // Get border style for selected plot
  const getPlotBorder = (plot: Plot | null) => {
    if (!plot) return ""
    if (plot.id === selectedPlotId) return "ring-4 ring-blue-500"

    return ""
  }

  // Calculate cell size based on screen size
  const getCellSize = () => {
    // Base size is 40px, but on small screens we reduce it
    return `${Math.max(20, 40 * scale)}px`
  }

  return (
    <div className="space-y-4">
      {/* Zoom controls */}
      <div className="flex justify-end space-x-2 mb-2">
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-full bg-blue-100 text-blue-700"
          onClick={() => setScale((prev) => Math.max(0.5, prev - 0.1))}
        >
          -
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-full bg-blue-100 text-blue-700"
          onClick={() => setScale((prev) => Math.min(1.5, prev + 0.1))}
        >
          +
        </motion.button>
      </div>

      <div className="overflow-auto -mx-4 px-4 pb-4">
        <div
          className="grid gap-1"
          style={{
            gridTemplateRows: `repeat(${maxRow + 1}, ${getCellSize()})`,
            gridTemplateColumns: `repeat(${maxCol + 1}, ${getCellSize()})`,
            minWidth: `${(maxCol + 1) * Number.parseInt(getCellSize()) + maxCol}px`,
          }}
        >
          {grid.map((row, rowIndex) =>
            row.map((plot, colIndex) => (
              <motion.div
                key={`${rowIndex}-${colIndex}`}
                className={`
                  flex items-center justify-center rounded
                  ${getPlotColor(plot)}
                  ${getPlotCursor(plot)}
                  ${getPlotBorder(plot)}
                  transition-all duration-200
                  hover:opacity-80
                  active:scale-95
                `}
                whileTap={{ scale: 0.95 }}
                onClick={() => plot && onPlotClick(plot)}
              >
                {plot && plot.type === "plot" && (
                  <span className={`text-xs font-bold ${plot.ownerId === clientId ? "text-white" : ""}`}>
                    {plot.plotNumber}
                  </span>
                )}
              </motion.div>
            )),
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded bg-blue-600"></div>
          <span>Your Plots</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded bg-gray-400"></div>
          <span>Sold</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded bg-green-500"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded bg-gray-800"></div>
          <span>Road</span>
        </div>
      </div>
    </div>
  )
}

