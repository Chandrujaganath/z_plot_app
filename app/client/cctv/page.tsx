"use client"

import { useState, useEffect, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Video, RefreshCw, AlertCircle } from "lucide-react"
import { getClientOwnedPlots, getPlotDetails } from "@/lib/firebase-service"
import type { Plot } from "@/lib/models"
import { useAuth } from "@/lib/auth-context"

export default function LiveCCTVPage() {
  const [plots, setPlots] = useState<Plot[]>([])
  const [selectedPlotId, setSelectedPlotId] = useState<string>("")
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null)
  const [loading, setLoading] = useState(true)
  const [streamError, setStreamError] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const { user } = useAuth()
  const searchParams = useSearchParams()

  useEffect(() => {
    const fetchOwnedPlots = async () => {
      if (!user) return

      try {
        setLoading(true)

        // Get client's owned plots
        const plotsData = await getClientOwnedPlots(user.uid)
        setPlots(plotsData)
        // Check if plotId is in URL params
        const plotId = searchParams?.get("plotId")
        if (plotId && plotsData.some((plot) => plot.id === plotId)) {
          setSelectedPlotId(plotId)

          // Get plot details
          const plotDetails = await getPlotDetails(plotId)
          setSelectedPlot(plotDetails)
        } else if (plotsData.length > 0) {
          setSelectedPlotId(plotsData[0].id)

          // Get plot details
          const plotDetails = await getPlotDetails(plotsData[0].id)
          setSelectedPlot(plotDetails)
        }
      } catch (error) {
        console.error("Error fetching owned plots:", error)
        toast({
          title: "Error",
          description: "Failed to load your plots. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchOwnedPlots()
  }, [user, searchParams])

  useEffect(() => {
    // Initialize video stream when selectedPlot changes
    if (selectedPlot && selectedPlot.cctvFeedUrl && videoRef.current) {
      initializeStream()
    }
  }, [selectedPlot])

  const handlePlotChange = async (plotId: string) => {
    try {
      setLoading(true)
      setSelectedPlotId(plotId)

      // Get plot details
      const plotDetails = await getPlotDetails(plotId)
      setSelectedPlot(plotDetails)

      // Reset stream error
      setStreamError(false)
    } catch (error) {
      console.error("Error fetching plot details:", error)
      toast({
        title: "Error",
        description: "Failed to load plot details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const initializeStream = () => {
    if (!selectedPlot || !selectedPlot.cctvFeedUrl || !videoRef.current) return

    // Reset stream error
    setStreamError(false)

    // Initialize HLS.js or native video player
    try {
      // For demo purposes, we're just setting the src directly
      // In a real implementation, you would use HLS.js or similar for streaming
      videoRef.current.src = selectedPlot.cctvFeedUrl

      videoRef.current.onerror = () => {
        console.error("Video stream error")
        setStreamError(true)
      }

      videoRef.current.play().catch((error) => {
        console.error("Error playing video:", error)
        setStreamError(true)
      })
    } catch (error) {
      console.error("Error initializing stream:", error)
      setStreamError(true)
    }
  }

  const handleRefreshStream = () => {
    initializeStream()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Live CCTV Access</h1>
        <p className="text-muted-foreground">View live CCTV feed from your properties</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>CCTV Feed</CardTitle>
              <CardDescription>
                {selectedPlot ? `Viewing Plot #${selectedPlot.plotNumber}` : "Select a plot to view CCTV feed"}
              </CardDescription>
            </div>
            <div className="w-full sm:w-64">
              <Select value={selectedPlotId} onValueChange={handlePlotChange} disabled={loading || plots.length === 0}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a plot" />
                </SelectTrigger>
                <SelectContent>
                  {plots.map((plot) => (
                    <SelectItem key={plot.id} value={plot.id}>
                      Plot #{plot.plotNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-[400px] items-center justify-center rounded-md border">
              <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
            </div>
          ) : plots.length === 0 ? (
            <div className="flex h-[400px] flex-col items-center justify-center rounded-md border">
              <Video className="mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground">You don't own any plots yet</p>
              <Button variant="link" className="mt-2" onClick={() => (window.location.href = "/client/book-visit")}>
                Book a Visit to View Available Plots
              </Button>
            </div>
          ) : !selectedPlot ? (
            <div className="flex h-[400px] items-center justify-center rounded-md border">
              <p className="text-muted-foreground">Select a plot to view CCTV feed</p>
            </div>
          ) : !selectedPlot.cctvFeedUrl ? (
            <div className="flex h-[400px] flex-col items-center justify-center rounded-md border">
              <AlertCircle className="mb-2 h-8 w-8 text-amber-500" />
              <p className="text-muted-foreground">CCTV feed not available for this plot</p>
              <p className="mt-1 text-sm text-muted-foreground">Please contact support for assistance</p>
            </div>
          ) : streamError ? (
            <div className="flex h-[400px] flex-col items-center justify-center rounded-md border">
              <AlertCircle className="mb-2 h-8 w-8 text-red-500" />
              <p className="text-muted-foreground">Error loading CCTV feed</p>
              <Button variant="outline" className="mt-4" onClick={handleRefreshStream}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Stream
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative aspect-video overflow-hidden rounded-md bg-black">
                <video ref={videoRef} className="h-full w-full" controls autoPlay muted playsInline />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Plot #{selectedPlot.plotNumber}</h3>
                  <p className="text-sm text-muted-foreground">{selectedPlot.address || "Address not specified"}</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleRefreshStream}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Stream
                </Button>
              </div>

              <div className="rounded-md bg-muted p-4">
                <h3 className="font-medium">CCTV Information</h3>
                <p className="mt-1 text-sm">
                  This live feed is available 24/7 and is securely accessible only to you as the property owner.
                </p>
                <p className="mt-1 text-sm">
                  If you experience any issues with the feed, please try refreshing the stream or contact support.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Toaster />
    </div>
  )
}

