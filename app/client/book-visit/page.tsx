"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { CalendarIcon, Clock } from "lucide-react"
import {
  getProject,
  getProjectPlots,
  getAvailableTimeSlots,
  createVisitRequest,
  getProjects,
} from "@/lib/firebase-service"
import type { Project, Plot, TimeSlot } from "@/lib/models"
import { useAuth } from "@/lib/auth-context"
import ClientPlotGrid from "@/components/client-plot-grid"

export default function ClientBookVisitPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [plots, setPlots] = useState<Plot[]>([])
  const [selectedPlot, setSelectedPlot] = useState<Plot | null>(null)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("")
  const [phone, setPhone] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true)

        // Get projects
        const projectsData = await getProjects()
        setProjects(projectsData)

        // Check if projectId is in URL params
        const projectId = searchParams.get("projectId")
        if (projectId) {
          const project = await getProject(projectId)
          if (project) {
            setSelectedProject(project)

            // Fetch plots for this project
            const plotsData = await getProjectPlots(projectId)
            setPlots(plotsData)

            // Check if plotId is in URL params
            const plotId = searchParams.get("plotId")
            if (plotId) {
              const plot = plotsData.find((p) => p.id === plotId)
              if (plot) {
                setSelectedPlot(plot)
              }
            }
          }
        }

        // Get available time slots
        const timeSlotsData = await getAvailableTimeSlots()
        setTimeSlots(timeSlotsData)

        // Set phone from user profile if available
        if (user) {
          // This is a placeholder - in a real app, you would fetch the user's phone from their profile
          // setPhone(user.phoneNumber || "")
        }
      } catch (error) {
        console.error("Error fetching initial data:", error)
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchInitialData()
  }, [searchParams, user])

  const handleProjectChange = async (projectId: string) => {
    try {
      setLoading(true)
      const project = projects.find((p) => p.id === projectId)
      setSelectedProject(project || null)

      if (project) {
        const plotsData = await getProjectPlots(projectId)
        setPlots(plotsData)
      } else {
        setPlots([])
      }

      setSelectedPlot(null)
    } catch (error) {
      console.error("Error fetching project plots:", error)
      toast({
        title: "Error",
        description: "Failed to load plots for this project.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePlotClick = (plot: Plot) => {
    if (plot.type === "plot" && plot.status === "available") {
      setSelectedPlot(plot)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to book a visit.",
        variant: "destructive",
      })
      return
    }

    if (!selectedProject) {
      toast({
        title: "Error",
        description: "Please select a project.",
        variant: "destructive",
      })
      return
    }

    if (!selectedTimeSlot) {
      toast({
        title: "Error",
        description: "Please select a time slot for your visit.",
        variant: "destructive",
      })
      return
    }

    if (!phone) {
      toast({
        title: "Error",
        description: "Please provide your phone number.",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)

      const timeSlot = timeSlots.find((ts) => ts.id === selectedTimeSlot)
      if (!timeSlot) {
        throw new Error("Selected time slot not found")
      }

      const visitData = {
        userId: user.uid,
        userName: user.displayName || "",
        userEmail: user.email || "",
        userPhone: phone,
        projectId: selectedProject.id,
        projectName: selectedProject.name,
        plotId: selectedPlot?.id,
        plotNumber: selectedPlot?.plotNumber,
        timeSlotId: selectedTimeSlot,
        timeSlot: {
          date: timeSlot.date,
          startTime: timeSlot.startTime,
          endTime: timeSlot.endTime,
        },
        status: "pending" as const,
        notes: notes,
        isClient: true, // Flag to indicate this is a client booking
      }

      const visitId = await createVisitRequest(visitData)

      toast({
        title: "Visit Request Submitted",
        description: "Your visit request has been submitted and is pending approval.",
      })

      // Redirect to QR code viewer page
      router.push(`/client/dashboard?visitId=${visitId}`)
    } catch (error) {
      console.error("Error submitting visit request:", error)
      toast({
        title: "Error",
        description: "Failed to submit visit request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Book a Visit</h1>
        <p className="text-muted-foreground">Schedule a visit to explore new properties</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Visit Details</CardTitle>
              <CardDescription>Provide your information and select a time slot</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={user?.displayName || ""} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user?.email || ""} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project">Select Project</Label>
                <Select value={selectedProject?.id || ""} onValueChange={handleProjectChange} disabled={loading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeSlot">Select Time Slot</Label>
                <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot} disabled={loading}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a time slot" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot.id} value={slot.id}>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4" />
                          <span>{slot.date}</span>
                          <Clock className="ml-2 h-4 w-4" />
                          <span>
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any specific requirements or questions?"
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Submitting..." : "Book Visit"}
              </Button>
            </CardFooter>
          </Card>

          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Select a Plot (Optional)</CardTitle>
              <CardDescription>Click on an available plot to select it for your visit</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedProject ? (
                plots.length > 0 ? (
                  <ClientPlotGrid
                    plots={plots}
                    onPlotClick={handlePlotClick}
                    selectedPlotId={selectedPlot?.id}
                    clientId={user?.uid || ""}
                  />
                ) : (
                  <div className="flex h-40 items-center justify-center">
                    <p className="text-muted-foreground">No plots available for this project</p>
                  </div>
                )
              ) : (
                <div className="flex h-40 items-center justify-center">
                  <p className="text-muted-foreground">Please select a project first</p>
                </div>
              )}

              {selectedPlot && (
                <div className="mt-4 rounded-md border p-4">
                  <h3 className="font-medium">Selected Plot</h3>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Plot Number:</span> {selectedPlot.plotNumber}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Size:</span> {selectedPlot.size} sq ft
                    </div>
                    <div>
                      <span className="text-muted-foreground">Price:</span> ${selectedPlot.price.toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </form>

      <Toaster />
    </div>
  )
}

