"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Home, RouteIcon as Road } from "lucide-react"
import type { GridCell } from "@/lib/models"

interface TemplateLayoutEditorProps {
  gridCells: GridCell[][]
  updateCell: (row: number, col: number, updates: Partial<GridCell>) => void
}

export default function TemplateLayoutEditor({ gridCells, updateCell }: TemplateLayoutEditorProps) {
  const [selectedTool, setSelectedTool] = useState<"plot" | "road" | "empty">("plot")
  const [isDrawing, setIsDrawing] = useState(false)
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)
  const [plotNumber, setPlotNumber] = useState<string>("")
  const [plotSize, setPlotSize] = useState<string>("")

  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    // If cell is already of the selected type, select it for editing
    if (gridCells[row][col].type === selectedTool && selectedTool === "plot") {
      setSelectedCell({ row, col })
      setPlotNumber(gridCells[row][col].plotNumber?.toString() || "")
      setPlotSize(gridCells[row][col].size?.toString() || "")
    } else {
      // Otherwise, change the cell type
      updateCell(row, col, { type: selectedTool })

      // If setting to plot, assign a default plot number
      if (selectedTool === "plot") {
        // Find the highest plot number and increment by 1
        let highestPlotNumber = 0
        gridCells.forEach((row) => {
          row.forEach((cell) => {
            if (cell.type === "plot" && cell.plotNumber && cell.plotNumber > highestPlotNumber) {
              highestPlotNumber = cell.plotNumber
            }
          })
        })

        updateCell(row, col, { plotNumber: highestPlotNumber + 1 })
      }
    }
  }

  // Handle mouse down on cell
  const handleMouseDown = (row: number, col: number) => {
    setIsDrawing(true)
    handleCellClick(row, col)
  }

  // Handle mouse enter on cell during drawing
  const handleMouseEnter = (row: number, col: number) => {
    if (isDrawing) {
      updateCell(row, col, { type: selectedTool })

      // If setting to plot, assign a default plot number
      if (selectedTool === "plot") {
        // Find the highest plot number and increment by 1
        let highestPlotNumber = 0
        gridCells.forEach((row) => {
          row.forEach((cell) => {
            if (cell.type === "plot" && cell.plotNumber && cell.plotNumber > highestPlotNumber) {
              highestPlotNumber = cell.plotNumber
            }
          })
        })

        updateCell(row, col, { plotNumber: highestPlotNumber + 1 })
      }
    }
  }

  // Handle mouse up to stop drawing
  const handleMouseUp = () => {
    setIsDrawing(false)
  }

  // Update plot details
  const handleUpdatePlotDetails = () => {
    if (!selectedCell) return

    const updates: Partial<GridCell> = {}

    if (plotNumber) {
      updates.plotNumber = Number.parseInt(plotNumber, 10)
    }

    if (plotSize) {
      updates.size = Number.parseInt(plotSize, 10)
    }

    updateCell(selectedCell.row, selectedCell.col, updates)
    setSelectedCell(null)
  }

  // Cancel plot details editing
  const handleCancelPlotDetails = () => {
    setSelectedCell(null)
  }

  // Get cell class based on type
  const getCellClass = (cell: GridCell) => {
    const baseClass = "border border-gray-300 transition-colors"

    if (selectedCell && selectedCell.row === cell.row && selectedCell.col === cell.col) {
      return `${baseClass} ring-2 ring-primary ring-offset-2`
    }

    switch (cell.type) {
      case "plot":
        return `${baseClass} bg-green-100 hover:bg-green-200`
      case "road":
        return `${baseClass} bg-gray-300 hover:bg-gray-400`
      default:
        return `${baseClass} bg-white hover:bg-gray-100`
    }
  }

  return (
    <div className="space-y-4" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={selectedTool === "plot" ? "default" : "outline"}
          className="flex items-center gap-2"
          onClick={() => setSelectedTool("plot")}
        >
          <Home className="h-4 w-4" />
          <span>Plot</span>
        </Button>
        <Button
          type="button"
          variant={selectedTool === "road" ? "default" : "outline"}
          className="flex items-center gap-2"
          onClick={() => setSelectedTool("road")}
        >
          <Road className="h-4 w-4" />
          <span>Road</span>
        </Button>
        <Button
          type="button"
          variant={selectedTool === "empty" ? "default" : "outline"}
          className="flex items-center gap-2"
          onClick={() => setSelectedTool("empty")}
        >
          <span>Empty</span>
        </Button>
      </div>

      <div className="overflow-auto">
        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${gridCells[0]?.length || 0}, minmax(40px, 1fr))`,
          }}
        >
          {gridCells.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={getCellClass(cell)}
                style={{ aspectRatio: "1/1", minWidth: "40px" }}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
              >
                {cell.type === "plot" && cell.plotNumber && (
                  <div className="flex h-full w-full items-center justify-center text-xs font-medium">
                    {cell.plotNumber}
                  </div>
                )}
              </div>
            )),
          )}
        </div>
      </div>

      {selectedCell && (
        <div className="rounded-md border p-4 mt-4">
          <h3 className="font-medium mb-3">Edit Plot Details</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="plotNumber">Plot Number</Label>
              <Input
                id="plotNumber"
                type="number"
                value={plotNumber}
                onChange={(e) => setPlotNumber(e.target.value)}
                placeholder="e.g. 101"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plotSize">Plot Size (sq ft)</Label>
              <Input
                id="plotSize"
                type="number"
                value={plotSize}
                onChange={(e) => setPlotSize(e.target.value)}
                placeholder="e.g. 1000"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={handleCancelPlotDetails}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePlotDetails}>Update Plot</Button>
          </div>
        </div>
      )}

      <div className="rounded-md bg-muted p-4">
        <p className="text-sm">
          <strong>Instructions:</strong> Click on cells to toggle between plot, road, and empty. Click and drag to paint
          multiple cells. Click on a plot to edit its details.
        </p>
      </div>
    </div>
  )
}

