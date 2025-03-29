"use client"

import { useEffect, useRef } from "react"

interface PlotLayoutCanvasProps {
  projectId: string
}

export default function PlotLayoutCanvas({ projectId }: PlotLayoutCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth
    canvas.height = 300

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw plot layout (placeholder)
    const plotSize = 30
    const gap = 5
    const rows = 5
    const cols = Math.floor(canvas.width / (plotSize + gap))

    // Draw grid of plots
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * (plotSize + gap)
        const y = row * (plotSize + gap)

        // Randomly determine if plot is sold or available
        const isSold = Math.random() > 0.4

        // Set color based on status
        ctx.fillStyle = isSold ? "#d1d5db" : "#10b981"

        // Draw plot
        ctx.fillRect(x, y, plotSize, plotSize)

        // Add plot number
        ctx.fillStyle = "#000000"
        ctx.font = "10px Arial"
        const plotNumber = row * cols + col + 1
        ctx.fillText(plotNumber.toString(), x + 10, y + 18)
      }
    }

    // Add legend
    ctx.fillStyle = "#000000"
    ctx.font = "12px Arial"
    ctx.fillText("Legend:", 10, rows * (plotSize + gap) + 20)

    ctx.fillStyle = "#10b981"
    ctx.fillRect(70, rows * (plotSize + gap) + 10, 15, 15)
    ctx.fillStyle = "#000000"
    ctx.fillText("Available", 90, rows * (plotSize + gap) + 22)

    ctx.fillStyle = "#d1d5db"
    ctx.fillRect(170, rows * (plotSize + gap) + 10, 15, 15)
    ctx.fillStyle = "#000000"
    ctx.fillText("Sold", 190, rows * (plotSize + gap) + 22)
  }, [projectId])

  return (
    <div className="rounded-md border bg-background p-2">
      <canvas ref={canvasRef} className="h-[300px] w-full" />
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Click on a plot to view details (Placeholder - Interactive map will be implemented in future phases)
      </p>
    </div>
  )
}

