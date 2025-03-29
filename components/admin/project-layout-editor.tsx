"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Home, RouteIcon as Road, Trash } from "lucide-react"
import type { GridCell } from "@/lib/models"

interface ProjectLayoutEditorProps {
  gridCells: GridCell[][]
  updateCell: (row: number, col: number, updates: Partial<GridCell>) => void
}

export default function ProjectLayoutEditor({ gridCells, updateCell }: ProjectLayoutEditorProps) {
  const [editMode, setEditMode] = useState<"plot" | "road" | "erase">("plot")
  const [isDragging, setIsDragging] = useState(false)
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)
  const [plotDetailsOpen, setPlotDetailsOpen] = useState(false)
  const [plotDetails, setPlotDetails] = useState({
    plotNumber: "",
    size: "",
    price: "",
    description: "",
  })

  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    const cell = gridCells[row][col]

    if (editMode === "plot") {
      if (cell.type !== "plot") {
        // Set as plot
        updateCell(row, col, { type: "plot" })
      } else {
        // Open plot details dialog
        setSelectedCell({ row, col })
        setPlotDetails({
          plotNumber: cell.plotNumber?.toString() || "",
          size: cell.size?.toString() || "",
          price: cell.price?.toString() || "",
          description: cell.description || "",
        })
        setPlotDetailsOpen(true)
      }
    } else if (editMode === "road") {
      // Toggle as road
      updateCell(row, col, { type: "road" })
    } else if (editMode === "erase") {
      // Set as empty
      updateCell(row, col, { type: "empty" })
    }
  }

  // Handle mouse events for drag functionality
  const handleMouseDown = (row: number, col: number) => {
    setIsDragging(true)
    handleCellClick(row, col)
  }

  const handleMouseEnter = (row: number, col: number) => {
    if (isDragging) {
      const cell = gridCells[row][col]

      if (editMode === "plot" && cell.type !== "plot") {
        updateCell(row, col, { type: "plot" })
      } else if (editMode === "road") {
        updateCell(row, col, { type: "road" })
      } else if (editMode === "erase") {
        updateCell(row, col, { type: "empty" })
      }
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Save plot details
  const savePlotDetails = () => {
    if (!selectedCell) return

    const { row, col } = selectedCell

    updateCell(row, col, {
      plotNumber: plotDetails.plotNumber ? Number.parseInt(plotDetails.plotNumber, 10) : undefined,
      size: plotDetails.size ? Number.parseFloat(plotDetails.size) : undefined,
      price: plotDetails.price ? Number.parseFloat(plotDetails.price) : undefined,
      description: plotDetails.description,
    })

    setPlotDetailsOpen(false)
  }

  // Get cell style based on type
  const getCellStyle = (cell: GridCell) => {
    if (cell.type === "plot") {
      return "bg-green-200 hover:bg-green-300 border-2 border-green-500"
    } else if (cell.type === "road") {
      return "bg-gray-700 hover:bg-gray-600"
    } else {
      return "bg-white hover:bg-gray-100 border border-gray-300"
    }
  }

  return (
    <div className="space-y-4" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      <div className="flex flex-wrap gap-2">
        <ToggleGroup type="single" value={editMode} onValueChange={(value) => value && setEditMode(value as any)}>
          <ToggleGroupItem value="plot" aria-label="Plot mode">
            <Home className="h-4 w-4 mr-2" />
            Plot
          </ToggleGroupItem>
          <ToggleGroupItem value="road" aria-label="Road mode">
            <Road className="h-4 w-4 mr-2" />
            Road
          </ToggleGroupItem>
          <ToggleGroupItem value="erase" aria-label="Erase mode">
            <Trash className="h-4 w-4 mr-2" />
            Erase
          </ToggleGroupItem>
        </ToggleGroup>

        <div className="ml-auto text-sm text-muted-foreground">
          {editMode === "plot" ? (
            <span>Click to add plots. Click on existing plots to edit details.</span>
          ) : editMode === "road" ? (
            <span>Click or drag to add roads for access.</span>
          ) : (
            <span>Click or drag to erase cells.</span>
          )}
        </div>
      </div>

      <div className="overflow-auto border rounded-md p-4 bg-muted/20">
        <div
          className="grid gap-1 w-fit mx-auto"
          style={{
            gridTemplateRows: `repeat(${gridCells.length}, 40px)`,
            gridTemplateColumns: `repeat(${gridCells[0]?.length || 0}, 40px)`,
          }}
        >
          {gridCells.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`
                  flex items-center justify-center text-xs font-medium
                  transition-colors cursor-pointer
                  ${getCellStyle(cell)}
                `}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
              >
                {cell.type === "plot" && (cell.plotNumber || "")}
              </div>
            )),
          )}
        </div>
      </div>

      <Dialog open={plotDetailsOpen} onOpenChange={setPlotDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Plot Details</DialogTitle>
            <DialogDescription>Enter the details for this plot</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="plotNumber">Plot Number</Label>
                <Input
                  id="plotNumber"
                  type="number"
                  value={plotDetails.plotNumber}
                  onChange={(e) => setPlotDetails({ ...plotDetails, plotNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="size">Size (sq ft)</Label>
                <Input
                  id="size"
                  type="number"
                  value={plotDetails.size}
                  onChange={(e) => setPlotDetails({ ...plotDetails, size: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input
                id="price"
                type="number"
                value={plotDetails.price}
                onChange={(e) => setPlotDetails({ ...plotDetails, price: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={plotDetails.description}
                onChange={(e) => setPlotDetails({ ...plotDetails, description: e.target.value })}
                placeholder="Any additional details about this plot"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setPlotDetailsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={savePlotDetails}>Save Plot Details</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

