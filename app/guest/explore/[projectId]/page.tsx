"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Home, MapPin } from "lucide-react"
import { getProject, getProjectPlots } from "@/lib/firebase-service"
import type { Project, Plot } from "@/lib/models"
import PlotGrid from "@/components/plot-grid"
import { formatIndianCurrency } from "@/lib/utils"

export default function ProjectDetailPage({ params }: { params: { projectId: string } }) {
  const [project, setProject] = useState<Project | null>(null)
  const [plots, setPlots] = useState<Plot[]>([])
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const projectData = await getProject(params.projectId)
        if (!projectData) {
          router.push("/guest/explore")
          return
        }

        setProject(projectData)

        const plotsData = await getProjectPlots(params.projectId)
        setPlots(plotsData)
      } catch (error) {
        console.error("Error fetching project data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjectData()
  }, [params.projectId, router])

  const handlePlotClick = (plot: Plot) => {
    if (plot.type === "plot" && plot.status === "available") {
      setSelectedPlot(plot)
    }
  }

  const handleBookVisit = () => {
    if (selectedPlot) {
      router.push(`/guest/book-visit?projectId=${params.projectId}&plotId=${selectedPlot.id}`)
    } else {
      router.push(`/guest/book-visit?projectId=${params.projectId}`)
    }
  }

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!project) {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{project.name}</h1>
          <p className="text-muted-foreground">{project.location}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video overflow-hidden rounded-md bg-muted">
                {project.imageUrl ? (
                  <img
                    src={project.imageUrl || "/placeholder.svg"}
                    alt={project.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Home className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <p>{project.description}</p>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{project.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Home className="h-4 w-4 text-muted-foreground" />
                  <span>Plot Sizes: {project.plotSizes}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">₹</span>
                  <span>Starting Price: {formatIndianCurrency(project.startingPrice)}</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium">Available Plots:</span> {project.availablePlots} of {project.totalPlots}
                </div>
              </div>
              <div className="pt-4">
                <Button onClick={handleBookVisit} className="w-full">
                  Book a Visit
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Plot Legend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-green-500"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-gray-400"></div>
                  <span>Sold</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-yellow-500"></div>
                  <span>Reserved</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-gray-800"></div>
                  <span>Road</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-blue-500"></div>
                  <span>Amenity</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Plot Layout</CardTitle>
              <CardDescription>Click on an available plot to view details</CardDescription>
            </CardHeader>
            <CardContent>
              <PlotGrid plots={plots} onPlotClick={handlePlotClick} selectedPlotId={selectedPlot?.id} />
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={!!selectedPlot} onOpenChange={(open) => !open && setSelectedPlot(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Plot #{selectedPlot?.plotNumber}</DialogTitle>
            <DialogDescription>Details about the selected plot</DialogDescription>
          </DialogHeader>
          {selectedPlot && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Plot Number</p>
                  <p>{selectedPlot.plotNumber}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Size</p>
                  <p>{selectedPlot.size} sq ft</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Price</p>
                  <p>{formatIndianCurrency(selectedPlot.price)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge className="mt-1 bg-green-500">{selectedPlot.status}</Badge>
                </div>
              </div>
              <Button onClick={handleBookVisit} className="w-full">
                Book a Visit for This Plot
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

