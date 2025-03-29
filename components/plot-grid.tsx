"use client"

import { useMemo, useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ZoomIn, ZoomOut, Move, Grid } from "lucide-react"
import type { Plot } from "@/lib/models"

interface PlotGridProps {
  plots: Plot[]
  onPlotClick: (plot: Plot) => void
  selectedPlotId?: string
}

export default function PlotGrid({ plots, onPlotClick, selectedPlotId }: PlotGridProps) {
  const [scale, setScale] = useState(1)
  const [isMobile, setIsMobile] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 640
      setIsMobile(mobile)
      // Set smaller initial scale on mobile
      if (mobile && scale === 1) {
        setScale(0.7)
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
    if (!plot) return "bg-gray-50"

    if (plot.type === "road") return "bg-gray-800 shadow-inner"
    if (plot.type === "amenity") return "bg-blue-500 shadow-inner"

    switch (plot.status) {
      case "available":
        return "bg-gradient-to-br from-green-400 to-green-500 shadow-sm"
      case "sold":
        return "bg-gradient-to-br from-gray-300 to-gray-400 shadow-inner"
      case "reserved":
        return "bg-gradient-to-br from-yellow-400 to-yellow-500 shadow-sm"
      default:
        return "bg-white shadow-sm"
    }
  }

  // Get cursor style based on plot type and status
  const getPlotCursor = (plot: Plot | null) => {
    if (!plot) return ""
    if (plot.type !== "plot") return ""
    if (plot.status !== "available") return ""

    return "cursor-pointer"
  }

  // Get border style for selected plot
  const getPlotBorder = (plot: Plot | null) => {
    if (!plot) return ""
    if (plot.id === selectedPlotId) return "ring-4 ring-blue-500 z-10"

    return ""
  }

  // Calculate cell size based on screen size and current scale
  const getCellSize = () => {
    // Base size is 40px, but on small screens we reduce it
    return Math.max(28, 40 * scale)
  }

  // Handle mouse or touch down on grid container
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true)
    
    if ('touches' in e) {
      setStartPosition({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      })
    } else {
      setStartPosition({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      })
    }
  }

  // Handle mouse or touch move
  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return
    
    if ('touches' in e) {
      setPosition({
        x: e.touches[0].clientX - startPosition.x,
        y: e.touches[0].clientY - startPosition.y
      })
    } else {
      setPosition({
        x: e.clientX - startPosition.x,
        y: e.clientY - startPosition.y
      })
    }
  }

  // Handle mouse or touch up
  const handleDragEnd = () => {
    setIsDragging(false)
  }

  // Zoom out (decrease scale)
  const zoomOut = () => {
    setScale((prev) => Math.max(0.4, prev - 0.1))
  }

  // Zoom in (increase scale)
  const zoomIn = () => {
    setScale((prev) => Math.min(1.5, prev + 0.1))
  }

  // Reset position and zoom
  const resetView = () => {
    setPosition({ x: 0, y: 0 })
    setScale(isMobile ? 0.7 : 1)
  }

  return (
    <div className="space-y-4">
      {/* Controls for zoom and pan */}
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm text-gray-500 flex items-center">
          <Grid className="h-4 w-4 mr-1" />
          <span>{plots.length} plots • {Math.round(scale * 100)}% zoom</span>
        </div>
        <div className="flex shadow-md rounded-full bg-white border border-gray-100">
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="p-2 text-gray-600 hover:text-blue-600 focus:outline-none rounded-l-full"
            onClick={zoomOut}
            aria-label="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="p-2 text-gray-600 hover:text-blue-600 focus:outline-none border-l border-r border-gray-100"
            onClick={resetView}
            aria-label="Reset view"
          >
            <Move className="h-4 w-4" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="p-2 text-gray-600 hover:text-blue-600 focus:outline-none rounded-r-full"
            onClick={zoomIn}
            aria-label="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </motion.button>
        </div>
      </div>

      {/* Instructions for mobile users */}
      {isMobile && (
        <div className="text-xs text-center text-gray-500 bg-blue-50 p-2 rounded-lg mb-3">
          Pinch to zoom, drag to move around the plot grid
        </div>
      )}

      {/* Draggable and zoomable grid */}
      <div 
        className="overflow-hidden rounded-xl bg-white shadow-md border border-gray-100 p-4"
        style={{ height: '400px' }}
      >
        <div 
          className="h-full overflow-hidden relative touch-none"
          onMouseDown={handleDragStart}
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
        >
          <motion.div
            style={{ 
              x: position.x, 
              y: position.y,
              cursor: isDragging ? 'grabbing' : 'grab'
            }}
            className="origin-center inline-block"
          >
            <div
              className="grid gap-1"
              style={{
                gridTemplateRows: `repeat(${maxRow + 1}, ${getCellSize()}px)`,
                gridTemplateColumns: `repeat(${maxCol + 1}, ${getCellSize()}px)`,
                transform: `scale(${scale})`,
                transformOrigin: 'center',
                margin: '50px'
              }}
            >
              {grid.map((row, rowIndex) =>
                row.map((plot, colIndex) => (
                  <motion.div
                    key={`${rowIndex}-${colIndex}`}
                    className={`
                      flex items-center justify-center 
                      rounded-md relative overflow-hidden
                      ${getPlotColor(plot)}
                      ${getPlotCursor(plot)}
                      ${getPlotBorder(plot)}
                      transition-all duration-200
                    `}
                    whileHover={plot ? { scale: 1.05, zIndex: 5 } : {}}
                    whileTap={plot ? { scale: 0.95 } : {}}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (plot && !isDragging) onPlotClick(plot);
                    }}
                  >
                    {plot && plot.type === "plot" && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-xs font-bold ${
                          plot.status === "available" ? "text-white" : 
                          plot.status === "reserved" ? "text-white" : 
                          "text-gray-700"
                        }`}>
                          {plot.plotNumber}
                        </span>
                      </div>
                    )}
                    {plot && plot.type === "amenity" && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">A</span>
                      </div>
                    )}
                  </motion.div>
                )),
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs bg-white p-3 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded bg-gradient-to-br from-green-400 to-green-500"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded bg-gradient-to-br from-gray-300 to-gray-400"></div>
          <span>Sold</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded bg-gradient-to-br from-yellow-400 to-yellow-500"></div>
          <span>Reserved</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded bg-gray-800"></div>
          <span>Road</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded bg-blue-500"></div>
          <span>Amenity</span>
        </div>
      </div>
    </div>
  )
}

