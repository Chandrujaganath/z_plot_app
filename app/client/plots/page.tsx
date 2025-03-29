"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { db } from "@/lib/firebase-config"
import { collection, query, where, getDocs } from "firebase/firestore"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import PlotList from "@/components/plot-list"
import PlotDetails from "@/components/plot-details"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ClientPlotGrid from "@/components/client-plot-grid"
import type { Plot } from "@/lib/models"

export default function ClientPlotsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [plots, setPlots] = useState<Plot[]>([])
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeView, setActiveView] = useState<"list" | "grid">("list")
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    const fetchPlots = async () => {
      try {
        setLoading(true)
        const plotsRef = collection(db, "plots")
        const q = query(plotsRef, where("type", "==", "plot"))
        const querySnapshot = await getDocs(q)

        const plotsData: Plot[] = []
        querySnapshot.forEach((doc) => {
          plotsData.push({ id: doc.id, ...doc.data() } as Plot)
        })

        setPlots(plotsData)
      } catch (error) {
        console.error("Error fetching plots:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlots()
  }, [user, router])

  const handlePlotSelect = (plot: Plot) => {
    setSelectedPlot(plot)

    // On mobile, if we're in grid view, switch to list view to see details
    if (isMobile && activeView === "grid") {
      setActiveView("list")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Plots</h1>
          <p className="text-gray-500">View and manage your plots</p>
        </div>

        {/* View toggle */}
        <Tabs
          value={activeView}
          onValueChange={(value) => setActiveView(value as "list" | "grid")}
          className="w-full sm:w-auto"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="grid">Grid View</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plot list or grid */}
        <div className={activeView === "list" ? "lg:col-span-2" : "lg:col-span-3"}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Available Plots</CardTitle>
              <CardDescription>Browse through all available plots in the project</CardDescription>
            </CardHeader>
            <CardContent>
              {activeView === "list" ? (
                <PlotList
                  plots={plots}
                  onPlotSelect={handlePlotSelect}
                  selectedPlotId={selectedPlot?.id}
                  clientId={user?.uid}
                />
              ) : (
                <ClientPlotGrid
                  plots={plots}
                  onPlotClick={handlePlotSelect}
                  selectedPlotId={selectedPlot?.id}
                  clientId={user?.uid}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Plot details - only show in list view or on larger screens */}
        {(activeView === "list" || !isMobile) && selectedPlot && (
          <div className={`${activeView === "list" ? "lg:col-span-1" : "lg:col-span-3"}`}>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Plot Details</CardTitle>
                <CardDescription>Detailed information about the selected plot</CardDescription>
              </CardHeader>
              <CardContent>
                <PlotDetails plot={selectedPlot} />

                {selectedPlot.status === "available" && (
                  <div className="mt-6">
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      onClick={() => router.push(`/client/plots/${selectedPlot.id}/book`)}
                    >
                      Book This Plot
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

